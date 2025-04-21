const express = require('express')
const router = express.Router()
const { bookTickets, getMyBooking } = require('../controllers/BookingController')
const { protect } = require('../middlewares/authMiddleware')

router.post('/', protect, bookTickets)
router.get('/me', protect, getMyBooking)

module.exports = router