const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'user',
  host: process.env.POSTGRES_HOST || 'postgres',
  database: process.env.POSTGRES_DB || 'dustintime',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: process.env.POSTGRES_PORT || 5432,
});

const initScript = fs.readFileSync(path.join(__dirname, 'db/init.sql')).toString();

const initializeDatabase = async () => {
  try {
    await pool.query(initScript);
    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Error initializing database', err.stack);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initializeDatabase,
};
