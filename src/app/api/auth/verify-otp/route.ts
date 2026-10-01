import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!otp) {
      return NextResponse.json(
        { error: "Kode OTP wajib diisi." },
        { status: 400 }
      );
    }

    // Default test OTP for prototype: 123456
    if (otp === "123456") {
      const response = NextResponse.json({
        success: true,
        message: "Verifikasi OTP berhasil!",
      });

      response.cookies.set("rc_mock_role", "CUSTOMER", {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email: email?.toLowerCase().trim(),
        code: otp,
        used: false,
        expiresAt: { gte: new Date() },
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Kode OTP tidak valid atau sudah kadaluwarsa." },
        { status: 400 }
      );
    }

    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    const response = NextResponse.json({
      success: true,
      message: "Verifikasi OTP berhasil!",
    });

    response.cookies.set("rc_mock_role", "CUSTOMER", {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { error: "Gagal memverifikasi OTP." },
      { status: 500 }
    );
  }
}
