import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OrderStatus, TransactionType, TransactionStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { days = 1, paymentMethod = "BALANCE" } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const pricePerDay = Math.round(order.plan.price / order.plan.durationDays);
    const totalPrice = pricePerDay * days;

    if (paymentMethod === "BALANCE") {
      if (user.balance < totalPrice) {
        return NextResponse.json(
          { error: `Saldo wallet tidak mencukupi untuk perpanjangan (Dibutuhkan: Rp ${totalPrice.toLocaleString("id-ID")}).` },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { balance: { decrement: totalPrice } },
      });
    }

    const currentExpires = order.expiresAt ? new Date(order.expiresAt) : new Date();
    const baseDate = currentExpires.getTime() > Date.now() ? currentExpires : new Date();
    const newExpires = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

    const updated = await prisma.order.update({
      where: { id },
      data: {
        expiresAt: newExpires,
        status: OrderStatus.ACTIVE,
      },
    });

    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: TransactionType.EXTEND,
        amount: totalPrice,
        method: paymentMethod,
        status: TransactionStatus.SUCCESS,
        orderId: order.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Perpanjangan sewa ${days} hari berhasil!`,
      expiresAt: updated.expiresAt?.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
