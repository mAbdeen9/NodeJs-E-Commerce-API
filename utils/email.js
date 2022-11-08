const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
      user: 'shopzon-@outlook.com',
      pass: '203590492ma',
    },
  });
  // define email options
  const mailOptions = {
    from: 'shopzon-@outlook.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html
  };

  // send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
