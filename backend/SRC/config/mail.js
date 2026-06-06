const nodemailer = require("nodemailer");

const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT
        ? Number(process.env.SMTP_PORT)
        : 587,
    secure: false,
    auth:
        smtpUser && smtpPass
            ? {
                  user: smtpUser,
                  pass: smtpPass
              }
            : undefined
});

module.exports = transporter;