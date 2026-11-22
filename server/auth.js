export function getOptionalUser(authorization, verifyToken) {
  const header = String(authorization ?? "");
  if (!header.startsWith("Bearer ") || typeof verifyToken !== "function") return null;

  const token = header.slice(7).trim();
  if (!token) return null;

  try {
    return verifyToken(token) ?? null;
  } catch {
    return null;
  }
}
