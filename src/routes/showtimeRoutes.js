const express = require('express')
const router = express.Router()
const { createShowtime, getShowtimesMovie, updateShowtime, deleteShowtime, getAllShowtime } = require('../controllers/showtimeController')
const { protect } = require('../middlewares/authMiddleware')
const adminMiddleware = require('../middlewares/adminMiddleware')

router.post('/', protect, adminMiddleware, createShowtime)
router.put('/:id', protect, adminMiddleware, updateShowtime)
router.delete('/:id', protect, adminMiddleware, deleteShowtime)

router.get('/', getAllShowtime)
router.get('/:movieId', getShowtimesMovie)

module.exports = router