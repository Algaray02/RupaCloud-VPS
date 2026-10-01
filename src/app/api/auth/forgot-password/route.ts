import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email wajib diisi." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Return positive message for security privacy
      return NextResponse.json({
        success: true,
        message: "Jika email terdaftar, instruksi instruksi reset password telah dikirim.",
      });
    }

    // Generate 6-digit random OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.otpCode.create({
      data: {
        email: user.email,
        code: otpCode,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Kode reset password berhasil dikirim ke ${email}. (Kode uji: ${otpCode})`,
    });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { error: "Gagal memproses permintaan reset password." },
      { status: 500 }
    );
  }
}
