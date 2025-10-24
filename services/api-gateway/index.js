require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const routes = require('./config/routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3000;

// --- CORE MIDDLEWARE ---
app.use(cors());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
}));
app.use(express.json());

// --- PROXY ROUTES ---
routes.forEach(route => {
    app.use(route.path, createProxyMiddleware(route.options));
});

app.get('/', (req, res) => {
    res.send('API Gateway is running!');
});

// --- ERROR HANDLING ---
app.use(errorHandler);

app.listen(port, () => {
    console.log(`API Gateway is running on http://localhost:${port}`);
});
