import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
};

export default withPWA({
  dest: "public",
  // Other next-pwa options can be added here
})(nextConfig);
