const Joi = require('joi');
const db = require('../db');

const cleanerProfileSchema = Joi.object({
  tagline: Joi.string().max(255),
  hourly_rate: Joi.number().precision(2),
  bio: Joi.string(),
  services: Joi.array().items(Joi.string()),
  specialized_tasks: Joi.object(),
  image_gallery_urls: Joi.array().items(Joi.string().uri()),
  availability: Joi.object(),
  badge: Joi.string().max(50),
});

exports.getAllCleaners = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.picture_url, cp.*
       FROM users u
       JOIN cleaner_profiles cp ON u.id = cp.user_id
       WHERE u.role = 'cleaner'`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getCleanerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.picture_url, cp.*
       FROM users u
       JOIN cleaner_profiles cp ON u.id = cp.user_id
       WHERE u.id = $1 AND u.role = 'cleaner'`,
      [id]
    );
    const cleaner = rows[0];
    if (!cleaner) {
      return res.status(404).json({ error: 'Cleaner not found' });
    }
    res.json(cleaner);
  } catch (err) {
    next(err);
  }
};

exports.createCleaner = async (req, res, next) => {
  try {
    // This assumes the user is already created with the 'cleaner' role
    const userId = req.userId;
    const { error, value } = cleanerProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      tagline, hourly_rate, bio, services, specialized_tasks,
      image_gallery_urls, availability, badge,
    } = value;

    const { rows } = await db.query(
      `INSERT INTO cleaner_profiles (user_id, tagline, hourly_rate, bio, services, specialized_tasks, image_gallery_urls, availability, badge)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, tagline, hourly_rate, bio, services, specialized_tasks, image_gallery_urls, availability, badge]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') { // unique_violation for user_id
      return res.status(409).json({ error: 'Cleaner profile already exists for this user.' });
    }
    next(err);
  }
};

exports.updateCleaner = async (req, res, next) => {
  try {
    const { id } = req.params;
    // In a real app, you'd check if req.userId matches the user_id of the profile
    // or if the user is an admin.
    const { error, value } = cleanerProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      tagline, hourly_rate, bio, services, specialized_tasks,
      image_gallery_urls, availability, badge,
    } = value;

    const { rows } = await db.query(
      `UPDATE cleaner_profiles
       SET tagline = $1, hourly_rate = $2, bio = $3, services = $4, specialized_tasks = $5,
           image_gallery_urls = $6, availability = $7, badge = $8
       WHERE user_id = $9
       RETURNING *`,
      [tagline, hourly_rate, bio, services, specialized_tasks, image_gallery_urls, availability, badge, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cleaner profile not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};
