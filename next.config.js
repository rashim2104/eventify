/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude pdfkit from webpack bundling to fix Helvetica.afm font file issues
  // pdfkit needs to run as a native Node.js package to find its bundled font data
  experimental: {
    serverComponentsExternalPackages: ['pdfkit'],
  },

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
