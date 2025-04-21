const express = require('express')
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController')
const router = express.Router()
const { protect } = require('../middlewares/authMiddleware')

router.post('./login', protect, login)
router.post('./register', protect, register)
router.post('./forgot-password', protect, forgotPassword)
router.post('./reset-password', protect, resetPassword)

module.exports = router