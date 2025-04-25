const Booking = require('../models/Booking')
const Showtime = require('../models/Showtime')
const generateTicketCode = require('../utils/generateTicketCode')
require('dotenv').config()
const PayOS = require('@payos/node');

const payos = new PayOS(
  '0daa0331-a2cd-4acd-b993-3ac13a05db4d',
  'f70f2e2a-027d-4f23-a1f6-5a3279e2f01d',
  'd97402d849f01d03633ff45c908d274feac291472fe853480c74802b45a47917'
);
console.log(process.env.PAYOS_CLIENT_ID)
console.log(process.env.PAYOS_API_KEY)
console.log(process.env.PAYOS_CHECKSUM_KEY)
const bookTickets = async (req, res) => {
    try {
      const { showtimeId, seats, paymentMethod } = req.body;
      const userId = req.user.id;
  
      if (!showtimeId || !seats || !paymentMethod)
        return res.status(400).json({ message: 'Thiếu thông tin đặt vé' });
  
      const showtime = await Showtime.findById(showtimeId);
      if (!showtime)
        return res.status(404).json({ message: 'Không tìm thấy suất chiếu' });
  
      const alreadyBooked = seats.some(seat =>
        showtime.seats.find(s => s.seatNumber === seat && s.status === 'booked')
      );
      if (alreadyBooked)
        return res.status(400).json({ message: 'Ghế đã được đặt trước' });

      const ticketCode = generateTicketCode();
      const totalPrice = Number(seats.length) * 49000
      const newBooking = new Booking({
        user: userId,
        showtime: showtimeId,
        seats,
        totalPrice,
        ticketCode,
        paymentMethod,
        paymentStatus: paymentMethod === 'counter' ? 'pending' : 'pending', 
      });
  // const paymentStatus = paymentMethod === 'pay-online' ? 'paid' : 'pending';
      await newBooking.save();
      if (paymentMethod === 'counter') {
        return res.status(201).json({
          message: 'Đặt vé thành công. Thanh toán tại quầy.',
          newBooking,
        });
      } else if (paymentMethod === 'pay-online') {
        const order = await payos.createPaymentLink({
          orderCode: ticketCode,
          amount: totalPrice,
          description: `Thanh toán  - Mã: ${ticketCode}`,
          returnUrl: 'http://localhost:5173/payment-success?code=${ticketCode}',
          cancelUrl: 'http://localhost:5173/payment-cancel?code=${ticketCode}'
        });
     
        return res.status(201).json({
          message: 'Tạo link thanh toán thành công',
          newBooking,
          payment: {
            qrCode: order.qrCode,
            checkoutUrl: order.checkoutUrl,
          }
        });
      }
      
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
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate({
        path: 'showtime',
        populate: { path: 'movie', select: 'title' }
      });

    if (!res.headersSent) {
      res.status(200).json(bookings);
    }
  } catch (error) {
    console.error('Error while getting bookings:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy vé' });
    }
  }
};

const confirmPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const booking = await Booking.findOne({
      user: userId,
      paymentMethod: 'pay-online',
      paymentStatus: 'pending',
    });

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy booking cần xác nhận' });
    }

    booking.paymentStatus = 'paid';
    await booking.save();

    return res.status(200).json({ message: 'Xác nhận thanh toán thành công', booking });
  } catch (error) {
    console.error('Lỗi xác nhận thanh toán:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi xác nhận thanh toán' });
  }
};

const cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy vé' });
        }

        // if (booking.paymentStatus !== 'pending') {
        //     return res.status(400).json({ message: 'Không thể hủy vé đã thanh toán' });
        // }

        const showtime = await Showtime.findById(booking.showtime);
        console.log('Các ghế đang được hủy:', booking.seats);
        showtime.seats = showtime.seats.map(seat => {
            if (booking.seats.includes(seat.seatNumber)) {
                return { ...seat, status: 'available' };
            }
            return seat;
        });
        await showtime.save();
        await Booking.findByIdAndDelete(bookingId);
        return res.status(200).json({ message: 'Hủy vé thành công' });
    } catch (error) {
        console.error('Lỗi khi hủy vé:', error);
        return res.status(500).json({ message: 'Lỗi khi hủy vé' });
    }
};

module.exports = { bookTickets, getMyBooking, cancelBooking, getAllBookings, confirmPayment}