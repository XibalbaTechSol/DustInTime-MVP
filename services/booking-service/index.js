const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { Kafka } = require('kafkajs');
const setupDb = require('./db');
const Joi = require('joi');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

let dbPool;

const kafka = new Kafka({
  clientId: 'booking-service',
  brokers: ['kafka:9092']
});

const producer = kafka.producer();

// --- Joi Schemas for Validation ---
const bookingSchema = Joi.object({
  cleanerId: Joi.string().required(),
  clientId: Joi.string().required(),
  date: Joi.date().iso().required(),
  time: Joi.string().required(),
  status: Joi.string().valid('pending', 'confirmed', 'completed', 'cancelled').default('pending'),
});

async function initializeApp() {
  dbPool = await setupDb();
  await producer.connect();

  const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(403).send({ message: 'No token provided.' });
    }

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'supersecret', (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: 'Unauthorized.' });
      }
      req.userId = decoded.id;
      next();
    });
  };

  // Bookings
  app.get('/api/bookings', /*verifyToken,*/ async (req, res) => {
    try {
      const bookingsResult = await dbPool.query('SELECT * FROM bookings');
      res.json(bookingsResult.rows);
    } catch (error) {
      console.error('Error getting bookings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/bookings', verifyToken, async (req, res) => {
    try {
      const { error, value } = bookingSchema.validate({ ...req.body, clientId: req.userId });
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const newBooking = {
        id: Date.now().toString(),
        ...value
      };

      await dbPool.query('INSERT INTO bookings (id, cleanerId, clientId, date, time, status) VALUES ($1, $2, $3, $4, $5, $6)', 
          [newBooking.id, newBooking.cleanerId, newBooking.clientId, newBooking.date, newBooking.time, newBooking.status]);
      
      await producer.send({
        topic: 'booking-requests',
        messages: [
          { value: JSON.stringify(newBooking) },
        ],
      });

      res.status(201).json(newBooking);
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/bookings/:id', verifyToken, async (req, res) => {
    try {
      const { status } = req.body;
      const bookingResult = await dbPool.query('SELECT * FROM bookings WHERE id = $1 AND clientId = $2', [req.params.id, req.userId]);
      const booking = bookingResult.rows[0];
      if (booking) {
          await dbPool.query('UPDATE bookings SET status = $1 WHERE id = $2', [status, req.params.id]);
          res.json({ ...booking, status });
      } else {
          res.status(404).send('Booking not found or you are not authorized to update it');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/bookings/:id/cancel', verifyToken, async (req, res) => {
    try {
      const bookingResult = await dbPool.query('SELECT * FROM bookings WHERE id = $1 AND clientId = $2', [req.params.id, req.userId]);
      const booking = bookingResult.rows[0];
      if (booking) {
          await dbPool.query('UPDATE bookings SET status = $1 WHERE id = $2', ['cancelled', req.params.id]);
          res.json({ ...booking, status: 'cancelled' });
      } else {
          res.status(404).send('Booking not found or you are not authorized to cancel it');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.use(errorHandler);

  app.get('/', (req, res) => {
    res.send('Booking service is running!');
  });

  app.listen(port, () => {
    console.log(`Booking service is running on http://localhost:${port}`);
  });
}

initializeApp();