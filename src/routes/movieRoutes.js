const express = required('express')
const router = express.Router()
const { protect } = require('../middlewares/authMiddleware')
const adminMiddleware = require('../middlewares/adminMiddleware')
const { getAllMovies, getShowingMovies, getComingMovies, searchMovies, createMovie, updateMovie, deleteMovie, addComment } = require('../controllers/movieController')

router.get('/', getAllMovies)
router.get('/showing', getShowingMovies)
router.get('/coming', getComingMovies)
router.get('/search', searchMovies)

router.post('/', protect, adminMiddleware, createMovie)
router.put('/:id', protect, adminMiddleware, updateMovie)
router.delete('/:id', protect, adminMiddleware, deleteMovie)

router.post('/:id/comments', protect, addComment)
