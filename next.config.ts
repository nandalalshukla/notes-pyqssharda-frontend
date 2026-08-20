import type { NextConfig } from "next";

// The backend lives on a different registrable domain (Render), so calling
// it directly from the browser makes every auth cookie a third-party
// cookie. Safari (ITP), Firefox (Total Cookie Protection), Brave, and most
// in-app webviews (Instagram/TikTok/etc.) block or partition those by
// default — the backend's Set-Cookie on login is silently dropped, so the
// user appears logged in for that one response but every subsequent
// request has no cookie at all. Chrome/Edge desktop still allow third-party
// cookies today, which is why this only shows up on "some devices".
//
// Routing every API call through this rewrite makes the browser's request
// same-origin (it only ever talks to the frontend's own domain); Next.js
// proxies it server-side to the real backend and relays the response
// (including Set-Cookie) back untouched. The cookie then lands as a normal
// first-party cookie, so no browser's cross-site cookie policy applies.
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://localhost:5000";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${BACKEND_ORIGIN}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
