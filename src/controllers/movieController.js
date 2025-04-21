const Movie = require('../models/Movie')
const User = require('../models/User')

const determineStatus = async (req, res) => {
    const today = Date.now()
    if (releaseDate > today)  return 'coming'
    if (endDate && endDate < today) return 'ended'
    return 'showing'
}

const getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find()
        const updateMovies = movies.map(movie => {
            const status = determineStatus(movie.releaseDate, movie.endDate)
            return {...movie.toObject(), status}
        })
        res.status(200).json(updateMovies)
    } catch (error) {
        res.status(500).json({ message: 'Loi may chu'})
    }
}

const getShowingMovies = async (req, res) => {
    try {
        const today = new Date()
        const movies = await Movie.find({
            releaseDate: {$lte: today}, 
            $or: [{ endDate: {$gte: today} }, { endDate: {$exist: false} }]
        })
        res.status(200).json(movies.map(movie => ({
            ...movie.toObject(), status: 'showing'
        })))
    } catch (error) {
        res.status(500).json({ message: 'Loi may chu'})
    }
}

const getComingMovies = async (req, res) => {
    try {
        const today = new Date()
        const movies = await Movie.find({
            releaseDate: {$gt: today}
        })
        res.status(200).json(movies.map(movie => ({
            ...movie.toObject(), status: 'coming'
        })))
    } catch (error) {
        res.status(500).json({ message: 'Loi may chu'})
    }
}

const searchMovies = async (req, res) => {
    const { q } = req.query
    try {
        const movies = await Movie.find({
            $or: [
                {title: {$regex: q, $option: 'i'}},
                {genre: {$regex: q, $option: 'i'}}
            ]
        })

        const today = new Date()
        const result = movies.map(movie => {
            const status = determineStatus(movie.releaseDate, movie.endDate)
            return { ...movie.toObject(), status}
        })

        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ message: 'Loi tim kiem'})
    }
}

const createMovie = async (req, res) => {
    try {
        const {
            title, genre, description, posterUrl, bannerUrl, releaseDate, endDate
        } = req.body

        const newMovie = new Movie({
            title, 
            genre,
            description,
            posterUrl,
            bannerUrl,
            releaseDate,
            endDate,
            status: determineStatus(new Date(releaseDate), endDate ? new Date(endDate) : null)
        })
        await newMovie.save()
        res.status(201).json({ message: 'Them phim thanh cong', movie: newMovie })
    } catch (error) {
        res.status(500).json({ message: 'Loi them phim'})
    }
}

const updateMovie = async (req, res) => {
    try {
        const { id } = req.params
        const {
            title, genre, description, posterUrl, bannerUrl, releaseDate, endDate
        } = req.body

        const movie = await Movie.findById(id)
        if (!movie)
            return res.status(404).json({ message: 'Khong tim thay phim'})

        movie.title = title || movie.title
        movie.genre = genre || movie.genre
        movie.desciption = description || movie.desciption
        movie.posterUrl = posterUrl || movie.posterUrl
        movie.bannerUrl = bannerUrl || movie.bannerUrl
        movie.releaseDate = releaseDate ? new Date(releaseDate) : movie.releaseDate
        movie.endDate = endDate ? new Date(endDate) : movie.endDate
        movie.status = determineStatus(releaseDate, endDate)

        await movie.save()
        res.status(200).json({ message: "Cap nhat thanh cong", movie})
    } catch (error) {
        res.status(500).json({ message: 'Loi cap nhat phim'})
    }
}

const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params
        const movie = await Movie.findOneAndDelete(id)
        res.status(200).json({ message: 'Xoa phim thanh cong'})
    } catch (error) {
        res.status(500).json({ messsage: 'Loi xoa phim'})
    }
}

const addComment = async (req, res) => {
    try {
        const { id } = req.params
        const { rating, text } = req.body
        const userId = req.user.id

        const movie = await Movie.findById(id)
        if (!movie)
            return res.status(404).json({ message: 'Khong tim thay phim'})

        const user = await User.findById(userId)
        const comment = {
            user: userId,
            username: user.fullName || 'Nguoi dung',
            text,
            rating
        }

        movie.comments.push(comment)
        movie.totalRating += rating
        movie.ratingCount += 1
        movie.avgRating = (movie.totalRating / movie.ratingCount).toFixed(1)

        await movie.save()
        res.status(200).json({ message: 'Da them danh gia', movie})
    } catch (error) {
        res.status(500).json({ message: 'Loi them danh gia'})
    }
}

module.exports = { getAllMovies, getShowingMovies, getComingMovies, searchMovies, createMovie, updateMovie, deleteMovie, addComment }