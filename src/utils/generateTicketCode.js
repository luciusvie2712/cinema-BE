const crypto = require('crypto')

const generateTicketCode = () => {
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase()
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    return `MOVIE-${datePart}-${randomPart}`
}

module.exports = generateTicketCode