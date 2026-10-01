import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Refresh user to get githubToken (since getSessionUser might cache or not select it if it's new)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { githubHandle: true, githubToken: true },
    });

    if (!dbUser || !dbUser.githubToken) {
      return NextResponse.json({ error: "Not connected to GitHub" }, { status: 400 });
    }

    // Fetch repositories using the token (sort by updated to get most recent)
    const reposResponse = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
      headers: {
        Authorization: `Bearer ${dbUser.githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!reposResponse.ok) {
      if (reposResponse.status === 401) {
        // Token is invalid/expired
        await prisma.user.update({
          where: { id: user.id },
          data: { githubHandle: null, githubToken: null },
        });
        return NextResponse.json({ error: "GitHub token expired. Please reconnect." }, { status: 401 });
      }
      return NextResponse.json({ error: "Failed to fetch repositories from GitHub" }, { status: reposResponse.status });
    }

    const reposData = await reposResponse.json();
    
    // Map to a cleaner format
    const repositories = reposData.map((repo: any) => ({
      id: repo.id,
      name: repo.full_name,
      url: repo.html_url,
      private: repo.private,
      defaultBranch: repo.default_branch,
      updatedAt: repo.updated_at,
    }));

    return NextResponse.json({
      success: true,
      githubHandle: dbUser.githubHandle,
      repositories,
    });
  } catch (error: any) {
    console.error("Fetch Repos Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
