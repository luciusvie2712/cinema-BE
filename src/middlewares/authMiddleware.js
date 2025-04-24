const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
    token = null 
        try {
            token = req.header('Authorization').replace('Bearer ', '')
            if (!token) {
                return res.status(401).json({ message: "Không tìm thấy token!" })
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET)  // Kiểm tra token hợp lệ
            req.user = await User.findById(decoded.userId).select('-password')  // Lấy thông tin user từ token

            next()  // Tiến hành tiếp tục middleware tiếp theo
        } catch (error) {
            res.status(401).json({ message: 'Token không hợp lệ', error})
        }
}

module.exports = { protect }