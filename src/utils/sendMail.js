const nodemailer = require('nodemailer')

var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "d44aabe8ab9321",
      pass: "7391d56ccc2625"
    }
});

const sendMail = async (to, subject, text) => {
    console.log('Đang gửi đến:', to)
    await transport.sendMail({ from: 'cinema@example.com', to, subject, text })
}

module.exports = sendMail