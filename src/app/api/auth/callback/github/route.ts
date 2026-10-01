import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(new URL("/settings?error=NoCodeProvided", request.url));
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.redirect(new URL("/login?error=Unauthorized", request.url));
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL("/settings?error=MissingGithubCredentials", request.url));
    }

    // 1. Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("Token exchange failed:", tokenData);
      return NextResponse.redirect(new URL("/settings?error=TokenExchangeFailed", request.url));
    }

    // 2. Fetch GitHub user profile
    const profileResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profileData = await profileResponse.json();
    const githubHandle = profileData.login;

    if (!githubHandle) {
      return NextResponse.redirect(new URL("/settings?error=ProfileFetchFailed", request.url));
    }

    // 3. Save to database
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        githubHandle,
        githubToken: accessToken,
      },
    });

    return NextResponse.redirect(new URL("/settings?success=GithubConnected", request.url));
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    return NextResponse.redirect(new URL("/settings?error=InternalError", request.url));
  }
}
