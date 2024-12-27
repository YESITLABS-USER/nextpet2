/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["admin.nextpetapp.com", "frontend.nextpetapp.com","frontendauth.nextpetapp.com"], // Add the allowed domain here
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // basePath: '/nextpet',
};

export default nextConfig;
