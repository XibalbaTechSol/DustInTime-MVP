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
    CREATE TABLE IF NOT EXISTS cleaner_locations (
      cleanerId TEXT PRIMARY KEY,
      lat REAL,
      lng REAL,
      geohash TEXT,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Database schema initialized for cleaner-location-service');
  return pool;
}

module.exports = setupDb;