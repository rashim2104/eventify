/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eventifys3.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;
