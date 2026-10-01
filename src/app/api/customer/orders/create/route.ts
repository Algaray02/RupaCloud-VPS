import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OrderStatus, TransactionType, TransactionStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planId, paymentMethod = "BALANCE" } = body;

    if (!planId) {
      return NextResponse.json({ error: "Paket wajib dipilih." }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.active) {
      return NextResponse.json({ error: "Paket tidak aktif atau tidak ditemukan." }, { status: 404 });
    }

    if (paymentMethod === "BALANCE") {
      if (user.balance < plan.price) {
        return NextResponse.json(
          { error: `Saldo wallet tidak mencukupi (Saldo: Rp ${user.balance.toLocaleString("id-ID")}, Tagihan: Rp ${plan.price.toLocaleString("id-ID")}).` },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { balance: { decrement: plan.price } },
      });
    }

    const now = new Date();
    const expires = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    const randomSub = `node-${Math.floor(100 + Math.random() * 900)}.rupacloud.id`;
    const randomIp = `103.147.22.${Math.floor(10 + Math.random() * 200)}`;
    const randomCont = `lxd-cont-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await prisma.order.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: OrderStatus.ACTIVE,
        containerId: randomCont,
        ipAddress: randomIp,
        subdomain: randomSub,
        startedAt: now,
        expiresAt: expires,
      },
      include: { plan: true },
    });

    const newTx = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: TransactionType.RENTAL,
        amount: plan.price,
        method: paymentMethod,
        status: TransactionStatus.SUCCESS,
        orderId: newOrder.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order berhasil dibuat!",
      order: {
        id: newOrder.id,
        subdomain: newOrder.subdomain,
        ipAddress: newOrder.ipAddress,
        expiresAt: newOrder.expiresAt?.toISOString(),
      },
      transactionId: newTx.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
