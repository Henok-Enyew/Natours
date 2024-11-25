const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
const AppError = require('./AppError');
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Henok Enyew <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      console.log('in productuoon');
      return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD,
          // user: process.env.SENDGRID_USERNAME,
          // pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    try {
      const html = pug.renderFile(
        `${__dirname}/../views/email/${template}.pug`,
        {
          firstName: this.firstName,
          url: this.url,
          subject,
        },
      );

      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        text: htmlToText(html),
        html,
      };

      await this.newTransport().sendMail(mailOptions);
      console.log('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw new AppError('There was an error sending the email.', 500);
    }
  }
  // async send(template, subject) {
  //   // 1. Render HTML based on pug template
  //   const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
  //     firstName: this.firstName,
  //     url: this.url,
  //     subject,
  //   });
  //   // 2 Define email options
  //   const mailOptions = {
  //     from: this.from,
  //     to: this.to,
  //     subject,
  //     text: htmlToText(html),
  //     html,
  //   };
  //   // 3. Create a tranpsort and send email
  //   await this.newTransport().sendMail(mailOptions);
  // }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to natours family!');
  }
  async sendVerfication() {
    await this.send(
      'verification',
      'Welcome to natours family! Please verfiy your email.',
    );
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)!',
    );
  }
};

// const sendEmail = async (options) => {
//   Create transporter

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   auth: {
//     user: process.env.EMAIL_USERNAME,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

//Define the email options

//   await transporter.sendMail(mailOptions);
// };
