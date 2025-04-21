const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware')
const { getRevenueStats } = require('../controllers/statisticsController');

router.get('/stats/revenue', protect, adminMiddleware, getRevenueStats);

module.exports = router;