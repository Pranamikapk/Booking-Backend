import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

const sendOTPmail = async (email: string, message: string): Promise<boolean> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ServerEmail,
      pass: process.env.ServerPassword,
    },
  });

  const mailOptions = {
    from: process.env.ServerEmail,
    to: email,
    subject: "StayEasy Notification",
    html: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error("Error occurred in sending email", error);
    return false;
  }
};

export default sendOTPmail;
