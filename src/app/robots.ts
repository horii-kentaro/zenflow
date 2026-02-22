import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.AUTH_URL || "https://zenflow.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/selfcare/", "/journal/", "/mood/", "/settings/", "/pricing/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
