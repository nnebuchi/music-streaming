const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

// const transporter = nodemailer.createTransport({
//     host: "mail.swiftymeals.com",
//     port: process.env.MAIL_PORT,
//     auth: {
//         user: process.env.MAIL_USERNAME, 
//         pass: process.env.MAIL_PASSWORD 
//     },
//     debug: true,
// });

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    },
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
  });

exports.send_mail = async (mail_data, subject, sender_name, res)=>{
    
    
    ejs.renderFile(
      path.join(__dirname, '../../views/mail', 'account_verification.ejs'),
      mail_data,
      (err, data) => {
          if (err) {
              return 'Error rendering email template\n'+err;
          }

          // Email options
          const mailOptions = {
              from: `${sender_name} ${process.env.MAIL_FROM_ADDRESS}`,
              to: mail_data.recipient, // replace with actual recipient email
              subject: subject,
              html: data
          };
          
          // Send email
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  console.log(error);
                  
                  return 'Error sending email';
              }
              return 'Email sent: ' + info.response;
          });
      }
    );
}