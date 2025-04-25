const { protect } = require('./authMiddleware')
const User = require('../models/User')

const adminMiddleware = async (req, res, next) => {
    try {
        await protect(req, res, next); // Kiem tra bao mat truoc 

        //Kiem tra nguoi dung co phai admin hay khong
        const user = await User.findById(req.user._id)
        console.log("🛡️ Admin middleware chạy, req.user:", req.user)
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Khong co quyen truy cap'})
        }
        next()
    } catch (error) {
        res.status(500).json({ message: 'Loi xac thuc quyen'})
    }
}

module.exports = adminMiddleware