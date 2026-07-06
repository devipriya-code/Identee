import ContactMessage from "../models/ContactMessage.js";
import transporter from "../utils/contactmailer.js";
import asyncHandler from "express-async-handler";

const sendContactEmail = asyncHandler(async (req, res) => {
  const { email, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 1. Save message in DB (optional but recommended)
    await ContactMessage.create({ email, message });

    // 2. Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "paletteproductiondevelopers@gmail.com",
      subject: "New Contact Request",
      text: `From: ${email}\n\nMessage:\n${message}`,
    });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Email sending failed" });
  }
});

export { sendContactEmail };
