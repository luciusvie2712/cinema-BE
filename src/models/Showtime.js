const mongoose = require('mongoose')

const showtimeSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        require: true
    },
    theater: {type: String, required: true},
    date: {type: Date, required: true},
    time: {type: String, require: true},
    format: {type: String, enum: ['2D', '3D'], default: '2D'},
    seats: [{
        seatNumber: String,
        status: {type: String, enum: ['available', 'booked'], default: 'available'}
    }]
})

module.exports = mongoose.model('Showtime', showtimeSchema)