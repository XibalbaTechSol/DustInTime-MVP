const Joi = require('joi');
const db = require('../db');

const reviewSchema = Joi.object({
  cleaner_id: Joi.string().uuid().required(),
  booking_id: Joi.string().uuid().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow('').max(1000),
});

exports.createReview = async (req, res, next) => {
  try {
    const clientId = req.userId;
    const { error, value } = reviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { cleaner_id, booking_id, rating, comment } = value;

    // In a real application, you should verify that the booking exists
    // and that the clientId matches the booking's client.

    const { rows } = await db.query(
      `INSERT INTO reviews (cleaner_id, client_id, booking_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [cleaner_id, clientId, booking_id, rating, comment]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') { // unique_violation
        return res.status(409).json({ error: 'A review for this booking already exists.' });
    }
    next(err);
  }
};

exports.getReviewsForCleaner = async (req, res, next) => {
  try {
    const { cleanerId } = req.params;
    const { rows } = await db.query('SELECT * FROM reviews WHERE cleaner_id = $1', [cleanerId]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM reviews WHERE id = $1', [id]);
    const review = rows[0];
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(review);
  } catch (err) {
    next(err);
  }
};
