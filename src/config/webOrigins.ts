// Exact origins only. A wildcard Vercel origin would expose private reports
// to unrelated Vercel sites when a browser sends authentication cookies.
export function allowedWebOrigins(): string[] {
  const values = [process.env.CLIENT_BASE_URL || "", ...(process.env.ALLOWED_WEB_ORIGINS || "").split(",")];
  if (process.env.NODE_ENV !== "production") values.push("http://localhost:3000");
  return values.map(v => v.trim()).filter(Boolean).map(value => {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
        url.search || url.hash || (url.pathname !== "/" && url.pathname !== "")) {
      throw new Error("Frontend origins must contain only scheme and hostname/port.");
    }
    return url.origin;
  });
}
export function isAllowedWebOrigin(origin: string | undefined) {
  return !origin || allowedWebOrigins().includes(origin);
}