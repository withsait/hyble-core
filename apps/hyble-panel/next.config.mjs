/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone mod Windows'ta symlink sorunu yaşatıyor, sunucuda aktif edilecek
  output: process.platform === "win32" ? undefined : "standalone",
  transpilePackages: ["@hyble/ui", "@hyble/api", "@hyble/db", "@hyble/email"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
