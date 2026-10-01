import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil.",
  });

  response.cookies.set("rc_mock_role", "GUEST", {
    path: "/",
    httpOnly: false,
    maxAge: 0,
  });

  return response;
}
