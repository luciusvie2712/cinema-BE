const nodemailer = requeri('nodemailer')

const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD,
    }
})

const sendMail = async (to, subject, text) => {
    await transporter.sendMail({ from: 'cinema@example.com', to, subject, text })
}

module.exports = sendMail