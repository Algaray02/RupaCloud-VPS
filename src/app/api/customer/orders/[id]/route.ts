import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    }

    if (order.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        userId: order.userId,
        planId: order.planId,
        status: order.status,
        containerId: order.containerId || undefined,
        ipAddress: order.ipAddress || undefined,
        subdomain: order.subdomain || undefined,
        startedAt: order.startedAt?.toISOString(),
        expiresAt: order.expiresAt?.toISOString(),
        createdAt: order.createdAt.toISOString(),
        plan: order.plan
          ? {
              id: order.plan.id,
              name: order.plan.name,
              durationDays: order.plan.durationDays,
              ramMb: order.plan.ramMb,
              cpuAllowance: order.plan.cpuAllowance,
              storageGb: order.plan.storageGb,
              price: order.plan.price,
              tier: order.plan.tier,
            }
          : undefined,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
