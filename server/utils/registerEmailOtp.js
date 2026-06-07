import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const RegisterEmailOtp = async ({ email, status, orderId }) => {
  // orderId here is actually OTP (you’re passing `OTP-${otp}` from controller)
  const otp = orderId.replace("OTP-", ""); // Extract just the OTP number

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Account Verification",
    text: `Your One-Time Password (OTP) is ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #007bff;">Email Verification</h2>
        <p>Dear User,</p>
        <p>Your One-Time Password (OTP) for verification is:</p>
        <h3 style="background: #f3f3f3; padding: 10px; display: inline-block; border-radius: 6px;">${otp}</h3>
        <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn’t request this, please ignore this email.</p>
        <br/>
        <p>Best regards,<br/>Viyavar Fashions</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP Email sent:", info.response);
  } catch (error) {
    console.error("❌ Email send failed:", error);
  }
};

export default RegisterEmailOtp;
