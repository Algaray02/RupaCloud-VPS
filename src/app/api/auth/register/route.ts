import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash: hashedPassword,
        role: "CUSTOMER",
        balance: 0,
      },
    });

    // Generate 6-digit random OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.otpCode.create({
      data: {
        email: newUser.email,
        code: otpCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
      },
    });

    // Send email via Nodemailer
    if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"RuPa Cloud" <${process.env.SMTP_EMAIL}>`,
        to: newUser.email,
        subject: "Kode OTP Registrasi RuPa Cloud",
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Selamat Datang di RuPa Cloud!</h2>
            <p>Halo ${newUser.name},</p>
            <p>Kode OTP untuk pendaftaran akun Anda adalah:</p>
            <h1 style="color: #2563eb; letter-spacing: 5px;">${otpCode}</h1>
            <p>Kode ini akan kadaluwarsa dalam 15 menit.</p>
          </div>
        `,
      });
    } else {
      console.warn("SMTP_EMAIL or SMTP_PASSWORD not set. Skipping real email send. OTP:", otpCode);
    }

    const response = NextResponse.json({
      success: true,
      message: "Registrasi berhasil! Silakan periksa email Anda untuk OTP.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

    return response;
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Gagal mendaftar. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
