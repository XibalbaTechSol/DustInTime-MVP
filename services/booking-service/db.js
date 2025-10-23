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
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      cleanerId TEXT,
      clientId TEXT,
      date TEXT,
      time TEXT,
      status TEXT
    );
  `);
  console.log('Database schema initialized for booking-service');
  return pool;
}

module.exports = setupDb;
