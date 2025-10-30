/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
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

  // Webpack configuration to handle native modules
  webpack: (config, { isServer, webpack }) => {
    // Exclude canvas from client-side bundles
    if (!isServer) {
      // Set canvas to false for client-side (browser doesn't need it)
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };

      // Ignore canvas module in client bundles
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^canvas$/,
        })
      );

      // Ignore .node files (native binaries) in client bundles
      config.plugins.push(
        new webpack.IgnorePlugin({
          checkResource(resource) {
            return resource.endsWith('.node');
          },
        })
      );
    }

    return config;
  },
};

module.exports = nextConfig;
