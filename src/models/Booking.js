const mongoose = require('mongoose')

const bookingShema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    showtime: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime'},
    seats: [String],
    totalPrice: Number,
    ticketCode: String,
    paymentMethod: { type: String, enum: ['counter', 'pay-online'], required: true},
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending'},
    createAt: { type: Date, default: Date.now}
})

module.exports = mongoose.model('Booking', bookingShema)