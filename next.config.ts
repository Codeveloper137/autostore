import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**", // Esto permite todas las rutas bajo ese dominio
      },
    ],
  },

  /* config options here */
  turbopack: {
  root: __dirname,
 },
};

export default nextConfig;
