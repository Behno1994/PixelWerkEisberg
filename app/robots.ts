import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Rechtsseiten brauchen keinen Index – sie sind über den Footer erreichbar.
      disallow: ["/api/", "/impressum", "/datenschutz", "/agb"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
