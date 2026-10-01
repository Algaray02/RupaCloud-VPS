import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TransactionType, PaymentMethod, TransactionStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, method = "GATEWAY" } = body;

    if (!amount || amount < 5000) {
      return NextResponse.json(
        { error: "Nominal top-up minimal Rp 5.000." },
        { status: 400 }
      );
    }

    // Update user balance
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { balance: { increment: amount } },
    });

    // Record topup transaction
    const tx = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: TransactionType.TOPUP,
        amount,
        method: method as PaymentMethod,
        status: TransactionStatus.SUCCESS,
        gatewayRef: `TOPUP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Top-up saldo sebesar Rp ${amount.toLocaleString("id-ID")} berhasil!`,
      newBalance: updatedUser.balance,
      transactionId: tx.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
