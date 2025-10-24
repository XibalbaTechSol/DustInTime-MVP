require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const authRoutes = require('./routes/auth');
const cleanerRoutes = require('./routes/cleaners');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Initialize database
db.initializeDatabase();

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/cleaners', cleanerRoutes);

app.get('/', (req, res) => {
  res.send('Cleaner service is running!');
});

// --- ERROR HANDLING ---
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Cleaner service is running on http://localhost:${port}`);
});
