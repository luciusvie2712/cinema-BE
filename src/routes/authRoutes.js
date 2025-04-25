const express = require('express')
const { register, login, forgotPassword, resetPassword, getUserInfo, verifyCode } = require('../controllers/authController')
const router = express.Router()
const { protect } = require('../middlewares/authMiddleware')
const { verify } = require('jsonwebtoken')


router.post('/login',  login)
router.post('/register',  register)
router.post('/forgot-password',  forgotPassword)
router.post('/reset-password',  resetPassword)
router.get('/me', protect, getUserInfo)
router.post('/verify-code', verifyCode)

module.exports = router