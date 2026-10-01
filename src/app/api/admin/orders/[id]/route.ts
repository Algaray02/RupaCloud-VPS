import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

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
    const { status, extendDays } = body;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    }

    let newExpires = existing.expiresAt;
    if (extendDays) {
      const base = existing.expiresAt ? new Date(existing.expiresAt) : new Date();
      newExpires = new Date(base.getTime() + Number(extendDays) * 24 * 60 * 60 * 1000);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(status ? { status: status as OrderStatus } : {}),
        ...(extendDays ? { expiresAt: newExpires } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Order ${updated.id} berhasil diperbarui.`,
      status: updated.status,
      expiresAt: updated.expiresAt?.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
