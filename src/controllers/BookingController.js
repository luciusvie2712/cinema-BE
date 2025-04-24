const Booking = require('../models/Booking')
const Showtime = require('../models/Showtime')
const generateTicketCode = require('../utils/generateTicketCode')

const bookTickets = async (req, res) => {
    try {
      const { showtimeId, seats, paymentMethod } = req.body;
      const userId = req.user.id;
  
      if (!showtimeId || !seats || !paymentMethod)
        return res.status(400).json({ message: 'Thiếu thông tin đặt vé' });
  
      const showtime = await Showtime.findById(showtimeId);
      if (!showtime)
        return res.status(404).json({ message: 'Không tìm thấy suất chiếu' });
  
      // Kiểm tra nếu ghế đã được đặt trước
      const alreadyBooked = seats.some(seat =>
        showtime.seats.find(s => s.seatNumber === seat && s.status === 'booked')
      );
      if (alreadyBooked)
        return res.status(400).json({ message: 'Ghế đã được đặt trước' });
  
      // Tạo booking và mã vé
      const ticketCode = generateTicketCode();
      const totalPrice = seats.length * 50000;
      const paymentStatus = paymentMethod === 'pay-online' ? 'paid' : 'pending';
  
      const newBooking = new Booking({
        user: userId,
        showtime: showtimeId,
        seats,
        totalPrice,
        ticketCode,
        paymentMethod,
        paymentStatus
      });
  
      await newBooking.save();
  
      showtime.seats = showtime.seats.map(seat => {
        if (seats.includes(seat.seatNumber)) {
          return { ...seat, status: 'booked' };
        }
        return seat;
      });
  
      await showtime.save();
  
      return res.status(201).json({ message: 'Đặt vé thành công', newBooking });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi khi đặt vé', error });
    }
  };


const getMyBooking = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id})
        .populate({
            path: 'showtime',
            populate: {path: 'movie', select: 'title'}
        })
        return res.json(bookings)
    } catch (error) {
        return res.status(500).json({ message: 'Loi may chu'})
    }
}

const cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy vé' });
        }

        if (booking.paymentStatus !== 'pending') {
            return res.status(400).json({ message: 'Không thể hủy vé đã thanh toán' });
        }

        const showtime = await Showtime.findById(booking.showtime);
        showtime.seats = showtime.seats.map(seat => {
            if (booking.seats.includes(seat.seatNumber)) {
                return { ...seat, status: 'available' };
            }
            return seat;
        });
        await showtime.save();
        await booking.remove();
        return res.status(200).json({ message: 'Hủy vé thành công' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi khi hủy vé' });
    }
};

module.exports = { bookTickets, getMyBooking, cancelBooking}