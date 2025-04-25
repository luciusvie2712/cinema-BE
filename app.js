const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./src/config/db')
const authRoutes = require('./src/routes/authRoutes')
const movieRoutes = require('./src/routes/movieRoutes')
const showtimeRoutes = require('./src/routes/showtimeRoutes')
const bookingRoutes = require('./src/routes/bookingRoutes')
const adminRoutes = require('./src/routes/adminRoutes');

dotenv.config()
connectDB()
const app = express()

app.use(cors({
    origin: 'http://localhost:5173'
  }));
app.use(express.json())

app.get('/', (req, res) => {
    res.send("CinemaGo API is running ")
})

app.use('/api/auth', authRoutes)
app.use('/api/movie', movieRoutes)
app.use('/api/showtime', showtimeRoutes)
app.use('/api/booking', bookingRoutes)
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})