const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function seedCleanerService() {
  const pool = new Pool({
    user: process.env.DB_USER || 'user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'dustintime',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        picture TEXT,
        role TEXT,
        address TEXT,
        propertyType TEXT,
        bedrooms INTEGER,
        bathrooms INTEGER,
        lat REAL,
        lng REAL,
        onboardingComplete INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS cleaners (
        id TEXT PRIMARY KEY,
        name TEXT,
        picture TEXT,
        rating REAL,
        hourlyRate REAL,
        services TEXT,
        location_lat REAL,
        location_lng REAL
      );
    `);

    const hashedPassword = await bcrypt.hash('password123', 8);

    await pool.query('INSERT INTO users (id, name, email, password, picture, role, address, propertyType, bedrooms, bathrooms, lat, lng, onboardingComplete) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT (id) DO NOTHING', 
      ['client1', 'Client One', 'client1@example.com', hashedPassword, 'https://i.pravatar.cc/150?u=client1', 'client', '123 Main St', 'House', 3, 2, 34.0522, -118.2437, 1]);

    await pool.query('INSERT INTO users (id, name, email, password, picture, role, address, propertyType, bedrooms, bathrooms, lat, lng, onboardingComplete) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT (id) DO NOTHING', 
      ['cleaner1', 'Cleaner One', 'cleaner1@example.com', hashedPassword, 'https://i.pravatar.cc/150?u=cleaner1', 'cleaner', '', '', 0, 0, 34.0522, -118.2437, 0]);

    await pool.query('INSERT INTO cleaners (id, name, picture, rating, hourlyRate, services, location_lat, location_lng) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING', 
      ['cleaner1', 'Cleaner One', 'https://i.pravatar.cc/150?u=cleaner1', 4.8, 25.00, '["Deep Cleaning", "Window Cleaning"]', 34.0522, -118.2437]);

    console.log('Cleaner service database seeded!');
  } catch (error) {
    console.error('Error seeding cleaner service database:', error);
  } finally {
    await pool.end();
  }
}

async function seedBookingService() {
  const pool = new Pool({
    user: process.env.DB_USER || 'user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'dustintime',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        cleanerId TEXT,
        clientId TEXT,
        date TEXT,
        time TEXT,
        status TEXT
      );
    `);

    await pool.query('INSERT INTO bookings (id, cleanerId, clientId, date, time, status) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING', 
      ['booking1', 'cleaner1', 'client1', '2025-10-25', '10:00', 'pending']);

    console.log('Booking service database seeded!');
  } catch (error) {
    console.error('Error seeding booking service database:', error);
  } finally {
    await pool.end();
  }
}

async function seedReviewService() {
  const pool = new Pool({
    user: process.env.DB_USER || 'user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'dustintime',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        cleanerId TEXT,
        clientId TEXT,
        bookingId TEXT,
        rating REAL,
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query('INSERT INTO reviews (id, cleanerId, clientId, bookingId, rating, comment) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING', 
      ['review1', 'cleaner1', 'client1', 'booking1', 5, 'Great service!']);

    console.log('Review service database seeded!');
  } catch (error) {
    console.error('Error seeding review service database:', error);
  } finally {
    await pool.end();
  }
}

async function seedAll() {
  await seedCleanerService();
  await seedBookingService();
  await seedReviewService();
  console.log('All databases seeded!');
}

seedAll();