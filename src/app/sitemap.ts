import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://portfolio.shreybuilds.com";
  return [
    { url: baseUrl, lastModified: new Date() },
  ];
}
