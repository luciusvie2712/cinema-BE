const Showtime = require('../models/Showtime')
const Movie = require('../models/Movie')

const createShowtime = async (req, res) => {
    try {
        const { movieId, theater, date, time, format } = req.body
        
        const movie = await Movie.findById(movieId)
        if (!movie) 
            return res.status(404).json({ message: 'Khong tim thay phim'})
        
        const newShowtime = new Showtime({
            movie: movieId,
            theater,
            date,
            time,
            format
        })

        await newShowtime.save()
        res.status(201).json({ message: 'Them suat chieu thanh cong', showtime: newShowtime})
    } catch (error) {
        res.status(500).json({ message: 'Loi tao suat chieu'})
    }
}

const getAllShowtime = async (req, res) => {
    try {
        const showtimes = Showtime.find()
        res.status(200).json(showtimes)
    } catch (error) {
        res.status(500).json({ message: 'Loi lay suat chieu'})
    }
}

const getShowtimesMovie = async (req, res) => {
    try {
        const { movieId } = req.params
        const showtimes = await Showtime.findById({movie: movieId}).sort({date: 1, time: 1})
        res.status(200).json(showtimes)
    } catch (error) {
        res.status(500).json({ message: 'Loi lay suat chieu'})
    }
}

const updateShowtime = async (req, res) => {
    try {
        const { id } = req.params 
        const { theater, date, time, format } = req.body

        const showtime = await Showtime.findById(id)
        if (!showtime)
            return res.status(404).json({ message: 'Khong tim thay suat chieu'})

        showtime.theater = theater || showtime.theater
        showtime.date = date || showtime.date
        showtime.time = time || showtime.time
        showtime.format = format || showtime.format

        await showtime.save()
        res.status(200).json({message: 'Cap nha suat chieu thanh cong',showtime})
    } catch (error) {
        res.status(500).json({message: 'Loi cap nhat suat chieu'})
    }
}

const deleteShowtime = async (req, res) => {
    try {
        const { id } = req.params
        await Showtime.findByIdAndDelete(id)
        res.status(200).json({ message: 'Xoa suat chieu thanh cong'})
    } catch (error) {
        res.status(500).json({ message: 'Loi thuc hien xoa suat chieu'})
    }
}

module.exports = { createShowtime, getShowtimesMovie, updateShowtime, deleteShowtime }