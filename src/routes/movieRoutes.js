const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/authMiddleware')
const adminMiddleware = require('../middlewares/adminMiddleware')
const { getAllMovies, getShowingMovies, getComingMovies, searchMovies, createMovie, updateMovie, deleteMovie, addComment, getMovieById } = require('../controllers/movieController')

router.get('/', getAllMovies)
router.get('/showing', getShowingMovies)
router.get('/coming', getComingMovies)
router.get('/search', searchMovies)
router.get('/:id', getMovieById)

router.post('/admin-movie',  createMovie)
router.put('/admin-movie/:id',  updateMovie)
router.delete('/admin-movie/:id',  deleteMovie)

router.post('/:id/comments', protect, addComment)

module.exports = router