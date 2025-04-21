const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
    let token
    if (
        req.headers.authorization && req.headers.authorization.startWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1]

            const decode = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await User.findById(decode.userId).select('-password')
            next()
        } catch (error) {
            res.status(401).json({ message: 'Token khong hop le'})
        }
    }
    if (!token) {
        res.status(401).json({ message: "Khong token! Truy cap bi tu choi"})
    }
}

module.exports = { protect }