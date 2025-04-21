const Booking = require('../models/Booking')
const Showtime = require('../models/Showtime')
const generateTicketCode = require('../utils/generateTicketCode')

const bookTickets = async (req, res) => {
    try {
        const {showtimeId, seats, paymentMethod} = req.body 
        const userId = req.user.id

        if (!showtimeId || !seats || !paymentMethod)
            return res.status(400).json({ message: 'Thieu thong tin dat ve'})

        const showtime = await Showtime.findById(showtimeId)
        if (!showtime)
            return res.status(404).json({ message: 'Khong tim thay suat chieu'})

        const alreadyBooked = seats.some(seat => 
            showtime.seats.find(s => s.seatNumber === seat && s.status === 'booked')
        )
        if (alreadyBooked)
            return res.status(400).json({ message: 'Ghe da duoc dat truoc'})

        showtime.seats = showtime.seats.map(seat => {
            if (seats.includes(seat.seatNumber)) {
                return { ...seat, status: 'booked'}
            }
            return seat
        })
        await showtime.save()

        const ticketCode = generateTicketCode()
        const totalPrice = seats.length * 50000
        const paymentStatus = paymentMethod === 'pay-online' ? 'paid' : 'pending'

        const newBooking = new Booking({
            user: userId,
            showtime: showtimeId,
            seats,
            totalPrice,
            ticketCode,
            paymentMethod,
            paymentStatus
        })

        await newBooking.save()

        res.status(201).json({ message: 'Dat ve thanh cong', newBooking})
    } catch (error) {
        res.status(500).json({ message: 'Loi khi dat ve'})
    }
}

const getMyBooking = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id})
        .populate({
            path: 'showtime',
            populate: {path: 'movie', select: 'title'}
        })
        res.json(bookings)
    } catch (error) {
        res.status(500).json({ message: 'Loi may chu'})
    }
}

module.exports = { bookTickets, getMyBooking}