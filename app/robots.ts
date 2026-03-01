import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://goldyon.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/pricing", "/login", "/register"],
        disallow: ["/dashboard", "/admin", "/settings", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
