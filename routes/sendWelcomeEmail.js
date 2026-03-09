// const nodemailer = require('nodemailer');
// require('dotenv').config();

// const sendWelcomeEmail = async (email, name) => {
//     try {
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS
//             }
//         });

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Welcome to Our Platform!',
//             html: `
//                 <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
//                     <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
//                         <h2 style="color: #333; margin-top: 0;">Welcome, ${name}!</h2>
//                         <p style="color: #666; font-size: 16px; line-height: 1.5;">
//                             Thank you for registering on our platform. We're thrilled to have you on board!
//                         </p>
//                         <p style="color: #666; font-size: 16px; line-height: 1.5;">
//                             Explore our services and enjoy your experience.
//                         </p>
//                         <p style="color: #999; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
//                             If you have any questions, feel free to contact us.
//                         </p>
//                     </div>
//                 </div>
//             `,
//             text: `Welcome, ${name}!\n\nThank you for registering on our platform. We're thrilled to have you on board!`
//         };

//         await transporter.sendMail(mailOptions);
//         console.log('Welcome email sent successfully to:', email);
//         return true;
//     } catch (error) {
//         console.error('Error sending welcome email via Nodemailer:', error);
//         return false;
//     }
// };

// module.exports = { sendWelcomeEmail };
const nodemailer = require('nodemailer');
require('dotenv').config();

const sendWelcomeEmail = async (email, name) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Porralia Batting App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Porralia Batting App!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-top: 0;">Welcome, ${name}!</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.5;">
                            Thank you for registering on Porralia Batting App. We're thrilled to have you on board!
                        </p>
                        <p style="color: #666; font-size: 16px; line-height: 1.5;">
                            Explore our services and enjoy your experience.
                        </p>
                        <p style="color: #999; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            If you have any questions, feel free to contact us.
                        </p>
                    </div>
                </div>
            `,
            text: `Welcome, ${name}!\n\nThank you for registering on Porralia Batting App. We're thrilled to have you on board!`
        };

        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully to:', email);
        return true;
    } catch (error) {
        console.error('Error sending welcome email via Nodemailer:', error);
        return false;
    }
};

module.exports = { sendWelcomeEmail };
