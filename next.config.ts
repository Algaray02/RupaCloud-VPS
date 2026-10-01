import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pastikan Prisma & bcrypt tidak pernah di-bundle ke client-side
  serverExternalPackages: ["@prisma/client", "prisma", "bcrypt"],
};

export default nextConfig;
