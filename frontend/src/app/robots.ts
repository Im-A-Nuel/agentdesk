import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const rules = { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard"] };
  return siteUrl
    ? { rules, sitemap: `${siteUrl}/sitemap.xml` }
    : { rules };
}
