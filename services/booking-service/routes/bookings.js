const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, bookingController.getAllBookings);
router.get('/:id', verifyToken, bookingController.getBookingById);
router.post('/', verifyToken, bookingController.createBooking);
router.put('/:id', verifyToken, bookingController.updateBookingStatus);
router.put('/:id/cancel', verifyToken, bookingController.cancelBooking);

module.exports = router;
