require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const reviewRoutes = require('./routes/reviews');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3007;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Initialize database
db.initializeDatabase();

// --- API ROUTES ---
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.send('Review service is running!');
});

// --- ERROR HANDLING ---
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Review service is running on http://localhost:${port}`);
});
