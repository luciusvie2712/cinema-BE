const express = require('express');
const router = express.Router();
const User = require('../models/User')
const { protect } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware')
const getRevenueStats = require('../controllers/statisticsController');

router.get('/stats/revenue', protect, adminMiddleware, getRevenueStats);
router.get('/users', protect ,adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password')
        return res.status(200).json(users)
    } catch (err) {
        if (!res.headersSent){
            res.status(500).json({ message: 'Lỗi lấy danh sách người dùng' })
        }
    }
})
router.delete('/users/:id', protect, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' })
        }

        await user.deleteOne()
        return res.status(200).json({ message: 'Xóa người dùng thành công' })
    } catch (err) {
        if (!res.headersSent){
            res.status(500).json({ message: 'Lỗi khi xóa người dùng' })
        }
    }
})


module.exports = router;