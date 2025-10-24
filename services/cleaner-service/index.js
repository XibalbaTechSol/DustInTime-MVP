const dotenv = require('dotenv');
const path =require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const setupDb = require('./db');
const axios = require('axios');
const Joi = require('joi');
const errorHandler = require('./middleware/errorHandler');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

let dbPool;

// --- Joi Schemas for Validation ---
const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('client', 'cleaner').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const cleanerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  picture: Joi.string().uri().required(),
  rating: Joi.number().min(0).max(5).required(),
  hourlyRate: Joi.number().positive().required(),
  services: Joi.array().items(Joi.string()).required(),
  location_lat: Joi.number().required(),
  location_lng: Joi.number().required(),
});

const onboardingSchema = Joi.object({
  address: Joi.string().required(),
  propertyType: Joi.string().required(),
  bedrooms: Joi.number().integer().min(1).required(),
  bathrooms: Joi.number().integer().min(1).required(),
  lat: Joi.number().required(),
  lng: Joi.number().required(),
});

async function initializeApp() {
  dbPool = await setupDb();

  // const indexCleaner = async (cleaner) => {
  //   try {
  //     await axios.post('http://search-service:3001/api/search/index-cleaner', cleaner);
  //   } catch (error) {
  //     console.error('Error indexing cleaner:', error.message);
  //   }
  // };

  // --- AUTHENTICATION ---

  const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(403).send({ message: 'No token provided.' });
    }

    jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: 'Unauthorized.' });
      }
      req.userId = decoded.id;
      next();
    });
  };

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { name, email, password, role } = value;

      const existingUser = await dbPool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 8);

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: hashedPassword,
        picture: `https://i.pravatar.cc/150?u=${Date.now().toString()}`,
        role: role || 'client',
        address: '',
        propertyType: 'Apartment',
        bedrooms: 1,
        bathrooms: 1,
        lat: 0,
        lng: 0,
        onboardingComplete: false,
      };

      await dbPool.query('INSERT INTO users (id, name, email, password, picture, role, address, propertyType, bedrooms, bathrooms, lat, lng, onboardingComplete) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
        [newUser.id, newUser.name, newUser.email, newUser.password, newUser.picture, newUser.role, newUser.address, newUser.propertyType, newUser.bedrooms, newUser.bathrooms, newUser.lat, newUser.lng, newUser.onboardingComplete]);

      const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
        expiresIn: 86400, // 24 hours
      });

      res.status(201).send({ auth: true, token });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email, password } = value;

      const userResult = await dbPool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = userResult.rows[0];

      if (!user) {
        return res.status(404).send('User not found.');
      }

      const passwordIsValid = await bcrypt.compare(password, user.password);
      if (!passwordIsValid) {
        return res.status(401).send({ auth: false, token: null });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: 86400, // 24 hours
      });

      res.status(200).send({ auth: true, token });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/auth/me', verifyToken, async (req, res) => {
    try {
      const userResult = await dbPool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
      const user = userResult.rows[0];

      if (!user) {
          return res.status(404).send('User not found.');
      }
      // Don't send the password hash
      const { password, ...userWithoutPassword } = user;
      res.status(200).send({ ...userWithoutPassword, onboardingComplete: user.onboardingcomplete });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  // --- API ROUTES ---

  // Cleaners
  app.get('/api/cleaners', async (req, res) => {
    try {
      const cleanersResult = await dbPool.query('SELECT * FROM cleaners');
      res.json(cleanersResult.rows);
    } catch (error) {
      console.error('Error getting cleaners:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/cleaners/:id', async (req, res) => {
    try {
      const cleanerResult = await dbPool.query('SELECT * FROM cleaners WHERE id = $1', [req.params.id]);
      const cleaner = cleanerResult.rows[0];
      if (cleaner) {
        // const reviewsResponse = await axios.get(`http://review-service:3007/api/reviews/cleaner/${cleaner.id}`);
        // cleaner.reviews = reviewsResponse.data;
        res.json(cleaner);
      } else {
          res.status(404).send('Cleaner not found');
      }
    } catch (error) {
      console.error('Error getting cleaner:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/cleaners', verifyToken, async (req, res) => {
    try {
      const { error, value } = cleanerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { name, picture, rating, hourlyRate, services, location_lat, location_lng } = value;
      const newCleaner = {
        id: Date.now().toString(),
        name,
        picture,
        rating,
        hourlyRate,
        services,
        location_lat,
        location_lng,
      };
      await dbPool.query('INSERT INTO cleaners (id, name, picture, rating, hourlyRate, services, location_lat, location_lng) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', 
        [newCleaner.id, newCleaner.name, newCleaner.picture, newCleaner.rating, newCleaner.hourlyRate, newCleaner.services, newCleaner.location_lat, newCleaner.location_lng]);
      
      // await indexCleaner(newCleaner);

      res.status(201).json(newCleaner);
    } catch (error) {
      console.error('Error creating cleaner:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/cleaners/:id', verifyToken, async (req, res) => {
    try {
      const { error, value } = cleanerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { name, picture, rating, hourlyRate, services, location_lat, location_lng } = value;
      const cleanerResult = await dbPool.query('SELECT * FROM cleaners WHERE id = $1', [req.params.id]);
      const cleaner = cleanerResult.rows[0];
      if (cleaner) {
        const updatedCleaner = {
          ...cleaner,
          name: name || cleaner.name,
          picture: picture || cleaner.picture,
          rating: rating || cleaner.rating,
          hourlyRate: hourlyRate || cleaner.hourlyRate,
          services: services || cleaner.services,
          location_lat: location_lat || cleaner.location_lat,
          location_lng: location_lng || cleaner.location_lng,
        };
        await dbPool.query('UPDATE cleaners SET name = $1, picture = $2, rating = $3, hourlyRate = $4, services = $5, location_lat = $6, location_lng = $7 WHERE id = $8', 
          [updatedCleaner.name, updatedCleaner.picture, updatedCleaner.rating, updatedCleaner.hourlyRate, updatedCleaner.services, updatedCleaner.location_lat, updatedCleaner.location_lng, req.params.id]);
        
        // await indexCleaner(updatedCleaner);

        res.json(updatedCleaner);
      } else {
        res.status(404).send('Cleaner not found');
      }
    } catch (error) {
      console.error('Error updating cleaner:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/onboarding/client', verifyToken, async (req, res) => {
    try {
      const { error, value } = onboardingSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { address, propertyType, bedrooms, bathrooms, lat, lng } = value;

      await dbPool.query('UPDATE users SET address = $1, propertyType = $2, bedrooms = $3, bathrooms = $4, lat = $5, lng = $6, onboardingComplete = true WHERE id = $7',
        [address, propertyType, bedrooms, bathrooms, lat, lng, req.userId]);

      res.status(200).send({ message: 'Client onboarding complete' });
    } catch (error) {
      console.error('Error completing client onboarding:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.use(errorHandler);

  app.get('/', (req, res) => {
    res.send('Cleaner service is running!');
  });

  app.listen(port, () => {
    console.log(`Cleaner service is running on http://localhost:${port}`);
  });
}

initializeApp();