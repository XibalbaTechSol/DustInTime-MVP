require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const searchRoutes = require('./routes/search');
const errorHandler = require('./middleware/errorHandler');
const elasticsearchService = require('./services/elasticsearchService');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// --- API ROUTES ---
app.use('/api/search', searchRoutes);

app.get('/', (req, res) => {
  res.send('Search service is running!');
});

// --- ERROR HANDLING ---
app.use(errorHandler);

const startServer = async () => {
    await elasticsearchService.connect();
    app.listen(port, () => {
        console.log(`Search service is running on http://localhost:${port}`);
    });
};

startServer();
