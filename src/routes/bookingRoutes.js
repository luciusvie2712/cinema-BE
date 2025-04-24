const express = require('express')
const router = express.Router()
const { bookTickets, getMyBooking, cancelBooking} = require('../controllers/BookingController')
const { protect } = require('../middlewares/authMiddleware')

router.post('/', protect, bookTickets)
router.get('/me', protect, getMyBooking)
router.delete('/cancel/:bookingId', cancelBooking);

module.exports = router