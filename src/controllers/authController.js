const User = require('../models/User')
const bcrypt = require('bcryptjs')
const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken')
const sendMail = require('../utils/sendMail')

const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return regex.test(password)
}

//Dang ky tai khoan 
const register = async (req, res) => {
    try {
        const { password, email, fullName, phone } = req.body
        if (!validatePassword(password))
            return res.status(400).json({ message: "Mat khau phai co it nhat 8 ky tu, bao gom ky tu hoa, ky tu thuong va ky tu so"})

        const userExist = await User.findOne({email})
        if (userExist)
            return res.status(400).json({ message: "Email da ton tai"})

        const hashed = await bcrypt.hashSync(password, salt)

        const newUser = new User({email, password: hashed, fullName, phone})
        await newUser.save()

        res.status(201).json({ message: "Dang ky tai khoan thanh cong"})
    } catch (error) {
        res.status(500).json({ message: "Loi khong the dang ky tai khoan"})
    }
}

//Dang nhap tai khoan
const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({email})
        if (!user) {
            
            return res.status(400).json({ message: "Email khong chinh xac"})
        }
        const isMatch = await bcrypt.compareSync(password, user.password)
        if (isMatch === false)
            return res.status(400).json({ message: "Password khong chinh xac"})

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        })

        res.json({
            token, 
            role: user.role,
            fullName: user.fullName
        })
    } catch (error) {
        res.status(500).json({ message: "Loi khong the dang nhap", error})
    }
}

// Quen mat khau
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        console.log("Email cần gửi:", email)
        const user = await User.findOne({email})
        if (!user)
            return res.status(400).json({ message: "Khong tim thay email"})

        const code = Math.floor(100000 + Math.random() * 900000).toString()
        user.resetCode = code
        user.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save()

        await sendMail(email, 'Password Reset Code', `Your code is ${code}`)

        res.json({ message: 'Reset code send to email'})
    } catch (error) {
        res.status(500).json({ message: "Loi khong the gui ma xac thuc"})
    }
}

const verifyCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email });
        console.log(user.resetCodeExpires)
        if (!user || user.resetCode !== code || new Date() > user.resetCodeExpires)
            return res.status(400).json({ message: "Mã xác thực không đúng hoặc đã hết hạn" });

        res.json({ message: "Mã xác thực chính xác" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xác thực mã" });
    }
};

//Thay doi mat khau
const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body

        const user = await User.findOne({email})
        if (!user || user.resetCode !== code || Date.now() > user.resetCodeExpires)
            return res.status(400).json({ message: "Ma xac thuc khong ton tai hoac da het han"})

        user.password = await bcrypt.hash(newPassword, 10)
        user.resetCode = undefined
        user.resetCodeExpires = undefined
        await user.save()

        res.json({ message: "Thay doi password thanh cong"})
    } catch (error) {
        res.status(500).json({ message: "Loi khong the thuc hien thay doi mat khau"})
    }
}

const getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');  // Không trả về mật khẩu
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng' });
    }
};

module.exports = {login, register, forgotPassword, verifyCode, resetPassword, getUserInfo }