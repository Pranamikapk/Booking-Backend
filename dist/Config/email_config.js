"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
const sendOTPmail = async (email, message) => {
    const transporter = nodemailer_1.default.createTransport({
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
    }
    catch (error) {
        console.error("Error occurred in sending email", error);
        return false;
    }
};
exports.default = sendOTPmail;
