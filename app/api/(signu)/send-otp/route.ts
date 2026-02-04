import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    // Generate a 4-digit unique code
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Play And Date" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h2 style="color: #ec4899;">Verification Code</h2>
          <p>Your 4-digit code for Joining the Club is:</p>
          <h1 style="font-size: 40px; letter-spacing: 10px; color: #111827;">${otp}</h1>
        </div>
      `,
    });

    return NextResponse.json({ otp }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
