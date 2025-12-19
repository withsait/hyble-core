/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@hyble/ui", "@hyble/database"],
  async redirects() {
    return [
      {
        source: '/game/:path*',
        destination: 'https://gaming.hyble.co/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
