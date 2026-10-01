import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("rc_user_id")?.value;
  const userEmail = cookieStore.get("rc_user_email")?.value;
  const role = cookieStore.get("rc_mock_role")?.value || "GUEST";

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) return user;
  }

  if (userEmail) {
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (user) return user;
  }

  // Fallback for role-based testing if no cookie matches: pick first matching user by role
  if (role !== "GUEST") {
    const fallbackUser = await prisma.user.findFirst({
      where: { role: role === "ADMIN" ? "ADMIN" : "CUSTOMER" },
      orderBy: { createdAt: "asc" },
    });
    if (fallbackUser) return fallbackUser;
  }

  return null;
}
