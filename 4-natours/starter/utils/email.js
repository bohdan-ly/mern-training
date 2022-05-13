const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter

  const transporter = nodemailer.createTransport({
    // @ts-ignore
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options

  const mailOptions = {
    from: 'Bohdan L <bohdan@klevercompany.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });

  // 3) Actually send the email
  // @ts-ignore
  const mail = await transporter.sendMail(mailOptions);

  console.log(`Preview URL: ${nodemailer.getTestMessageUrl(mail)}`);
};

module.exports = sendEmail;
