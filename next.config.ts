import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/gallery.php',
        destination: '/gallery',
        permanent: true,
      },
      {
        source: '/contact.php',
        destination: '/#contact',
        permanent: true,
      },
      {
        source: '/accommodation.php',
        destination: '/rooms',
        permanent: true,
      },
      {
        source: '/index.php',
        destination: '/',
        permanent: true,
      },
      {
        source: '/about-us.php',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
