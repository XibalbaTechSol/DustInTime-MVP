const { verifyToken } = require('../middleware/auth');

const services = {
    search: 'http://search-service:3001',
    cleaner: 'http://cleaner-service:3002',
    booking: 'http://booking-service:3003',
    review: 'http://review-service:3007',
    websocket: 'http://websocket-service:3008',
    payment: 'http://payment-service:3009',
    favorites: 'http://favorites-service:3011',
};

const routes = [
    {
        path: '/api/auth',
        options: { target: services.cleaner, changeOrigin: true },
    },
    {
        path: '/api/search',
        options: { target: services.search, changeOrigin: true },
    },
    {
        path: '/api/cleaners',
        middleware: [verifyToken],
        options: { target: services.cleaner, changeOrigin: true },
    },
    {
        path: '/api/bookings',
        middleware: [verifyToken],
        options: { target: services.booking, changeOrigin: true },
    },
    {
        path: '/api/reviews',
        middleware: [verifyToken],
        options: { target: services.review, changeOrigin: true },
    },
    {
        path: '/api/payments',
        middleware: [verifyToken],
        options: { target: services.payment, changeOrigin: true },
    },
    {
        path: '/api/favorites',
        middleware: [verifyToken],
        options: { target: services.favorites, changeOrigin: true },
    },
    {
        path: '/socket.io',
        options: { target: services.websocket, ws: true, logLevel: 'debug', changeOrigin: true },
    }
];

module.exports = routes;
