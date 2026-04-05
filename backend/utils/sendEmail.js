const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('CRITICAL ERROR: EMAIL_USER or EMAIL_PASS environment variables are missing.');
    throw new Error('Email configuration is missing. Please check your .env file.');
  }

  console.log(`Email Service: Attempting to send email to ${options.email}...`);

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: `"LearnAI Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html || options.message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email Service: Email sent successfully!', info.messageId);
  } catch (error) {
    console.error('Email Service Error: Failed to send email.', error.message);
    throw error;
  }
};

module.exports = sendEmail;
