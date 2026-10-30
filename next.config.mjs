/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/page/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/index.php',
        destination: '/',
        permanent: true,
      },
      {
        source: '/in.htm',
        destination: '/',
        permanent: true,
      },
      {
        source: '/hosting_index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/admin_login/:path*',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/admin/:path+',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/notice',
        destination: '/notices',
        permanent: true,
      },
      {
        source: '/notice/:path*',
        destination: '/notices',
        permanent: true,
      },
      {
        source: '/faq/:path*',
        destination: '/tax-guide',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
