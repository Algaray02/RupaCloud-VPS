import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nama, email, dan pesan harus diisi." },
        { status: 400 }
      );
    }

    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpEmail || !smtpPassword) {
      console.error("SMTP credentials not configured.");
      return NextResponse.json(
        { error: "Server email belum dikonfigurasi dengan benar." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    const mailOptions = {
      from: `"${name}" <${smtpEmail}>`, // using smtpEmail as sender to avoid DMARC/SPF issues
      replyTo: email, // setting reply-to to the user's email so replying works naturally
      to: smtpEmail, // sending to yourself (admin)
      subject: `[RuPa Cloud Contact] Pesan Baru dari ${name}`,
      text: `Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #052659;">Pesan Baru dari Form Kontak RuPa Cloud</h2>
          <p><strong>Nama:</strong> ${name}</p>
          <p><strong>Email Pengirim:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr style="border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p><strong>Pesan:</strong></p>
          <p style="white-space: pre-wrap; color: #374151;">${message}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Pesan berhasil dikirim." });
  } catch (error: any) {
    console.error("Error sending contact email:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengirim pesan. Silakan coba lagi nanti." },
      { status: 500 }
    );
  }
}
