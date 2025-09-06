const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.smtp2go.com',
  port: 587,
  secure: false, // true for 465, false for other ports like 587
  auth: {
    user: process.env.SMTP2GO_USER || 'support@hubstring.com',
    pass: process.env.SMTP2GO_PASS || 'dPFMXzuiadwHMU5n',
  },
});

module.exports = transporter;
