const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.post('/index-cleaner', searchController.indexCleaner);
router.get('/', searchController.searchCleaners);

module.exports = router;
