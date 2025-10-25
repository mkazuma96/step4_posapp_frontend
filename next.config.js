/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Azure App Service用の設定
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;

