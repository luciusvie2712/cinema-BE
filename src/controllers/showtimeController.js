const Showtime = require('../models/Showtime')
const Movie = require('../models/Movie')

const createShowtime = async (req, res) => {
    try {
        const { movieId, theater, date, time, format, seatCount } = req.body
        
        const movie = await Movie.findById(movieId)
        if (!movie) 
            return res.status(404).json({ message: 'Khong tim thay phim'})
        let seats = []
        for (let i = 1; i <= seatCount; i++) {
        seats.push({
            seatNumber: `A${i}`,
            status: 'available'
            });
        }
        
        const newShowtime = new Showtime({
            movie: movieId,
            theater,
            date,
            time,
            format, 
            seats
        })

        await newShowtime.save()
        return res.status(201).json({ message: 'Them suat chieu thanh cong', showtime: newShowtime})
    } catch (error) {
        if (!res.headersSent){
            return res.status(500).json({ message: 'Loi tao suat chieu', error})
        }
    }
}

const getAllShowtime = async (req, res) => {
    try {
        const showtimes = await Showtime.find().populate('movie')
        res.status(200).json(showtimes)
    } catch (error) {
        res.status(500).json({ message: 'Loi lay suat chieu'})
    }
}

const getShowtimesMovie = async (req, res) => {
    try {
        const { movieId } = req.params
        const showtimes = await Showtime.find({ movie: movieId }).sort({ date: 1, time: 1 })
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
        return res.status(200).json({message: 'Cap nha suat chieu thanh cong',showtime})
    } catch (error) {
        return res.status(500).json({message: 'Loi cap nhat suat chieu'})
    }
}

const deleteShowtime = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await Showtime.findByIdAndDelete(id);
  
      if (!result) {
        return res.status(404).json({ message: 'Suất chiếu không tồn tại' });
      }
  
      return res.status(200).json({ message: 'Xoá suất chiếu thành công' });
    } catch (error) {
      console.error('Lỗi khi xoá suất chiếu:', error);
      if (!res.headersSent) {
        return res.status(500).json({ message: 'Lỗi thực hiện xoá suất chiếu' });
      }
    }
  };

module.exports = { createShowtime, getAllShowtime, getShowtimesMovie, updateShowtime, deleteShowtime }