const Booking = require('../models/Booking')
const mongoose = require('mongoose')

const getRevenueStats = async (req, res) => {
    try {
        const { type } = req.query

        let matchCondition = { paymentStatus: 'paid'}
        let groupBy = {}
        let dateFormat

        if (type === 'week') {
            dateFormat = {$isoWeek: '$createAt'}
            groupBy = {
                _id: {
                    year: { $year: '$createAt'},
                    week: { $isoWeek: '$createAt'}
                }
            }
        } else if (type === 'month') {
            groupBy = {
                _id: {
                    year: { $year: '$createAt'},
                    month: { $month: '$createAt'}
                }
            }
        } else if (type === 'year') {
            groupBy = {
                _id: {
                    year: {$year: '$createAt'}
                }
            }
        } else {
            return res.status(400).json({ message: 'Tham so type truyen vao phai la week, month hoac year'})
        }

        const stats = await Booking.aggregate([
            {$match: matchCondition},
            {$group: {
                ...groupBy,
                totalRevenue: { $sum: '$totalPrice'},
                totalTickets: { $sum: {  $size: 'seats'}},
                bookings: { $sum: 1 }
            }},
            {$sort: { '_id.year': -1, '_id.month': -1}}
        ])

        const allStats = await Booking.aggregate([
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum : 1}
                }
            }
        ])

        res.json({
            stats, 
            paymentBreakdown: allStats
        })
    } catch (error) {
        res.status(500).json({ message: 'Loi may chu khong the thong ke doanh thu'})
    }
}

module.exports = getRevenueStats