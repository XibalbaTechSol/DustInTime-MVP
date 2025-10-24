const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, reviewController.createReview);
router.get('/cleaner/:cleanerId', reviewController.getReviewsForCleaner);
router.get('/:id', reviewController.getReviewById);

module.exports = router;
