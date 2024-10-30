import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com.',
    port: 587,
    secure: config.NODE_ENV === 'production',
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
<<<<<<< HEAD
      user: 'zillurrahmanbd12@gmail.com',
      pass: 'poks dokw npwr lsyz',
=======
      user: 'mezbaul@programming-hero.com',
      pass: 'xfqj dshz wdui ymtb',
>>>>>>> 47887c9c5d66776b87d3bff15332eac8f84e7ab0
    },
  });

  await transporter.sendMail({
<<<<<<< HEAD
    from: 'zillurrahmanbd12@gmail.com', // sender address
=======
    from: 'mezbaul@programming-hero.com', // sender address
>>>>>>> 47887c9c5d66776b87d3bff15332eac8f84e7ab0
    to, // list of receivers
    subject: 'Reset your password within ten mins!', // Subject line
    text: '', // plain text body
    html, // html body
  });
};
