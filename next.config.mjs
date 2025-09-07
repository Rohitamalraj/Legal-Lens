/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Fail the build on ESLint errors to catch issues early
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Fail the build on TS errors to minimize runtime issues
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
