const express = require('express');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
const errorHandler = require('./middleware/errorHandler');
const verifyToken = require('./middleware/auth');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(bodyParser.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(cors());

// Proxy for HTTP services
app.use('/api/search', createProxyMiddleware({ target: 'http://search-service:3001', changeOrigin: true }));
app.use('/api/cleaners', verifyToken, createProxyMiddleware({ target: 'http://cleaner-service:3002', changeOrigin: true }));
app.use('/api/bookings', verifyToken, createProxyMiddleware({ target: 'http://booking-service:3003', changeOrigin: true }));
app.use('/api/auth', createProxyMiddleware({ target: 'http://cleaner-service:3002', changeOrigin: true }));
app.use('/api/onboarding', verifyToken, createProxyMiddleware({ target: 'http://cleaner-service:3002', changeOrigin: true }));
app.use('/api/reviews', verifyToken, createProxyMiddleware({ target: 'http://review-service:3007', changeOrigin: true }));
app.use('/api/payments', verifyToken, createProxyMiddleware({ target: 'http://payment-service:3009', changeOrigin: true }));
app.use('/api/favorites', verifyToken, createProxyMiddleware({ target: 'http://favorites-service:3011', changeOrigin: true }));

// Proxy for WebSocket service
app.use('/socket.io', createProxyMiddleware({
  target: 'http://websocket-service:3008',
  changeOrigin: true,
  ws: true, // Enable WebSocket proxying
  logLevel: 'debug',
}));

app.use(errorHandler);

server.listen(3000, () => {
  console.log('API Gateway started on port 3000');
});