const express = require('express')
const { register, login, forgotPassword, resetPassword, getUserInfo } = require('../controllers/authController')
const router = express.Router()
const { protect } = require('../middlewares/authMiddleware')


router.post('/login',  login)
router.post('/register',  register)
router.post('/forgot-password',  forgotPassword)
router.post('/reset-password',  resetPassword)
router.get('/me', protect, getUserInfo)

module.exports = router