const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'user',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'dustintime',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function setupDb() {
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
  console.log('Database schema initialized for cleaner-service');
  return pool;
}

module.exports = setupDb;
