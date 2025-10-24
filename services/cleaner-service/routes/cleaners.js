const express = require('express');
const router = express.Router();
const cleanerController = require('../controllers/cleanerController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', cleanerController.getAllCleaners);
router.get('/:id', cleanerController.getCleanerById);
router.post('/', verifyToken, cleanerController.createCleaner);
router.put('/:id', verifyToken, cleanerController.updateCleaner);

module.exports = router;
