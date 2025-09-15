const { Low, JSONFile } = require('lowdb');

// Use JSONFile adapter
const adapter = new JSONFile('db.json');
const db = new Low(adapter);

// Set default data
db.data = db.data || { cleaners: [], bookings: [], users: [] };

// Write data to db.json
db.write();

module.exports = db;
