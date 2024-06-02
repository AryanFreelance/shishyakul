import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPWA({
  dest: "public",
  // Other next-pwa options can be added here
})(nextConfig);
