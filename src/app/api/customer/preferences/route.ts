import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get("pageKey") || "dashboard";

    const pref = await prisma.tutorialPref.findUnique({
      where: { userId_pageKey: { userId: user.id, pageKey } },
    });

    return NextResponse.json({
      success: true,
      dismissed: pref?.dismissed ?? false,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pageKey = "dashboard", dismissed = true } = body;

    const updated = await prisma.tutorialPref.upsert({
      where: { userId_pageKey: { userId: user.id, pageKey } },
      update: { dismissed },
      create: { userId: user.id, pageKey, dismissed },
    });

    return NextResponse.json({
      success: true,
      dismissed: updated.dismissed,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
