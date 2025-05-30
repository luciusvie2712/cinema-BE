const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    username: String,
    text: String,
    rating: {type: Number, min: 0, max: 5},
    createAt: {type: Date, default: Date.now}
})

const movieSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    genre: {type: [String] , required: true},
    posterUrl: {type: String, required: true},
    bannerUrl: {type: String, required: true},
    releaseDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    duration: {type: Number},
    status: {type: String, enum: ['coming', 'showing', 'ended'], default: 'coming'},
    rating: {type: Number},
    showtimes: [{
        date: {type: Date, required: true},
        time: {type: String, required: true} 
    }],
    comments: [commentSchema],
    totalRating: { type: Number, default: 0},
    ratingCount: { type: Number, default: 0},
    avgRating: {type: Number, default: 0}
}, {timestamps: true})

module.exports = mongoose.model('Movie', movieSchema)