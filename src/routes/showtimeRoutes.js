const express = require('express')
const router = express.Router()
const { createShowtime, getShowtimesMovie, updateShowtime, deleteShowtime, getAllShowtime } = require('../controllers/showtimeController')
const { protect } = require('../middlewares/authMiddleware')
const adminMiddleware = require('../middlewares/adminMiddleware')

router.post('/', createShowtime)
router.put('/:id', updateShowtime)
router.delete('/:id', deleteShowtime)

router.get('/', getAllShowtime)
router.get('/:movieId', getShowtimesMovie)

module.exports = router