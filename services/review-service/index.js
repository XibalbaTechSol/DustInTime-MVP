const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const Joi = require('joi');
const setupDb = require('./db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const port = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());

let dbPool;

// Joi schema for review validation
const reviewSchema = Joi.object({
  cleanerId: Joi.string().required(),
  clientId: Joi.string().required(),
  bookingId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().min(3).max(500).optional().allow(''),
});

async function initializeApp() {
  dbPool = await setupDb();

  // Create a new review
  app.post('/api/reviews', async (req, res, next) => {
    try {
      const { error, value } = reviewSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { cleanerId, clientId, bookingId, rating, comment } = value;
      const newReview = {
        id: Date.now().toString(),
        cleanerId,
        clientId,
        bookingId,
        rating,
        comment,
      };

      await dbPool.query(
        'INSERT INTO reviews (id, cleanerId, clientId, bookingId, rating, comment) VALUES ($1, $2, $3, $4, $5, $6)',
        [newReview.id, newReview.cleanerId, newReview.clientId, newReview.bookingId, newReview.rating, newReview.comment]
      );

      res.status(201).json(newReview);
    } catch (error) {
      next(error);
    }
  });

  // Get reviews for a specific cleaner
  app.get('/api/reviews/cleaner/:cleanerId', async (req, res, next) => {
    try {
      const { cleanerId } = req.params;
      const reviewsResult = await dbPool.query('SELECT * FROM reviews WHERE cleanerId = $1', [cleanerId]);
      res.json(reviewsResult.rows);
    } catch (error) {
      next(error);
    }
  });

  // Get a single review by ID
  app.get('/api/reviews/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const reviewResult = await dbPool.query('SELECT * FROM reviews WHERE id = $1', [id]);
      const review = reviewResult.rows[0];
      if (review) {
        res.json(review);
      } else {
        res.status(404).send('Review not found');
      }
    } catch (error) {
      next(error);
    }
  });

  app.get('/', (req, res) => {
    res.send('Review service is running!');
  });

  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`Review service started on port ${port}`);
  });
}

initializeApp();