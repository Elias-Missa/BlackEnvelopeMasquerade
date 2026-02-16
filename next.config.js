/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:54192"],
    },
  },
};

// Remove allowedOrigins in production to allow all origins
if (process.env.NODE_ENV === "production") {
  nextConfig.experimental = {};
}

module.exports = nextConfig;
