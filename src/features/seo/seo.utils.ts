export function getSafeSocialImageUrl(
  imageUrl: string | null | undefined,
  siteUrl: string,
  allowDemoHosts: boolean,
): string {
  const fallback = new URL("/placeholder.svg", siteUrl).toString();
  if (!imageUrl) return fallback;

  try {
    const image = new URL(imageUrl, siteUrl);
    const site = new URL(siteUrl);
    if (image.origin === site.origin && ["http:", "https:"].includes(image.protocol)) {
      return image.toString();
    }
    if (image.protocol !== "https:") return fallback;
    const hostAllowed =
      image.hostname === "res.cloudinary.com" ||
      (allowDemoHosts && ["images.unsplash.com", "picsum.photos"].includes(image.hostname));
    return hostAllowed ? image.toString() : fallback;
  } catch {
    return fallback;
  }
}
