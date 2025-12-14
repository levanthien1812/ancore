import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    // This glob pattern ensures the specific generated Prisma directory is included
    "./lib/generated/prisma": ["./lib/generated/prisma/**"],
    // You might also need to include the standard node_modules client location if your setup uses it:
    "/*": ["./node_modules/.prisma/client/**/*"],
  },
};

export default nextConfig;
