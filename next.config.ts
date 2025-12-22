/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Derleme sırasında tip hatalarını görmezden gel
    ignoreBuildErrors: true,
  },
  eslint: {
    // Derleme sırasında linter hatalarını görmezden gel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;