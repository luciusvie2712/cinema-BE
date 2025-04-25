const express = require('express')
const router = express.Router()
const { bookTickets, getMyBooking, cancelBooking, getAllBookings, confirmPayment} = require('../controllers/BookingController')
const { protect } = require('../middlewares/authMiddleware')
const adminMiddleware = require('../middlewares/adminMiddleware')

router.post('/', protect, bookTickets)
router.get('/me', protect, getMyBooking)
router.delete('/cancel/:bookingId', cancelBooking);
router.get('/', getAllBookings)
router.post('/confirm-payment', protect, confirmPayment);

module.exports = router