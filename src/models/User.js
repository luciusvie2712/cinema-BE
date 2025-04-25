const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    fullName: {type: String, required: true},
    phone: {type: String, required: true},
    password: {type: String, required: true},
    role: {type: String, required: true, enum: ['admin', 'user'], default: 'admin'},
    bookedTickets: {type: mongoose.Schema.Types.ObjectId, ref:'Booking'},
    resetCode: { type: String },
    resetCodeExpires: { type: Date },
    createAt: {type: Date, default: Date.now}
})

module.exports = mongoose.model('User', userSchema)