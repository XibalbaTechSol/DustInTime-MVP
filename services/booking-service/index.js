require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const kafkaService = require('./services/kafkaService');
const bookingRoutes = require('./routes/bookings');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3003;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// --- API ROUTES ---
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
  res.send('Booking service is running!');
});

// --- ERROR HANDLING ---
app.use(errorHandler);

const startServer = async () => {
    await db.initializeDatabase();
    await kafkaService.connect();
    app.listen(port, () => {
      console.log(`Booking service is running on http://localhost:${port}`);
    });
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await kafkaService.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await kafkaService.disconnect();
    process.exit(0);
});
