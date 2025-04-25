const crypto = require('crypto')

const generateTicketCode = () => {
    const orderCode = Math.floor(Math.random() * 9_00) + 1_00;
    return orderCode
}

module.exports = generateTicketCode