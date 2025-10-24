const Joi = require('joi');
const db = require('../db');
const kafkaService = require('../services/kafkaService');

const bookingSchema = Joi.object({
  cleaner_id: Joi.string().uuid().required(),
  client_name: Joi.string().required(),
  client_address: Joi.string().required(),
  scheduled_at: Joi.date().iso().required(),
  service_description: Joi.string().required(),
  duration_hours: Joi.number().integer().min(1).required(),
  cost_details: Joi.object().required(),
  specialized_tasks: Joi.array().items(Joi.object()),
  // client_location and status are handled internally
});

exports.getAllBookings = async (req, res, next) => {
  try {
    // This should be filtered based on user role (client or cleaner)
    const { rows } = await db.query('SELECT * FROM bookings WHERE client_id = $1', [req.userId]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM bookings WHERE id = $1 AND client_id = $2', [id, req.userId]);
    const booking = rows[0];
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or you are not authorized to view it' });
    }
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.createBooking = async (req, res, next) => {
  try {
    const clientId = req.userId;
    const { error, value } = bookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      cleaner_id, client_name, client_address, scheduled_at,
      service_description, duration_hours, cost_details, specialized_tasks,
    } = value;

    const { rows } = await db.query(
      `INSERT INTO bookings (cleaner_id, client_id, client_name, client_address, scheduled_at, status, service_description, duration_hours, cost_details, specialized_tasks)
       VALUES ($1, $2, $3, $4, $5, 'upcoming', $6, $7, $8, $9)
       RETURNING *`,
      [cleaner_id, clientId, client_name, client_address, scheduled_at, service_description, duration_hours, cost_details, specialized_tasks]
    );

    const newBooking = rows[0];
    await kafkaService.sendBookingRequest(newBooking);

    res.status(201).json(newBooking);
  } catch (err) {
    next(err);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['upcoming', 'active', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const { rows } = await db.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 AND client_id = $3 RETURNING *',
      [status, id, req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or you are not authorized to update it' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { rows } = await db.query(
        "UPDATE bookings SET status = 'cancelled' WHERE id = $1 AND client_id = $2 RETURNING *",
        [id, req.userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Booking not found or you are not authorized to cancel it' });
      }

      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  };
