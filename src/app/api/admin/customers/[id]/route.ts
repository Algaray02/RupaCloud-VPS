import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied: Admin only." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { toggleSuspend, balance, role } = body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(toggleSuspend !== undefined ? { suspended: !existing.suspended } : {}),
        ...(balance !== undefined ? { balance: Number(balance) } : {}),
        ...(role ? { role } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Data customer ${updated.name} berhasil diperbarui.`,
      customer: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        suspended: updated.suspended,
        balance: updated.balance,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
