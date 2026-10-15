export type OcrConfigResult =
  | { ok: true; url: string; apiKey: string }
  | { ok: false; reason: "missing_url" | "missing_key" | "invalid_url" };

export function readOcrConfig(env: Record<string, string | undefined>): OcrConfigResult {
  const rawUrl = env.OCR_API_URL;
  if (rawUrl === undefined || rawUrl.trim() === "") {
    return { ok: false, reason: "missing_url" };
  }

  const rawKey = env.OCR_API_KEY;
  if (rawKey === undefined || rawKey.trim() === "") {
    return { ok: false, reason: "missing_key" };
  }

  const url = rawUrl.trim();
  const apiKey = rawKey.trim();

  if (!url.startsWith("https://")) {
    return { ok: false, reason: "invalid_url" };
  }

  try {
    const parsed = new URL(url);
    if (!parsed.protocol || parsed.protocol !== "https:") {
      return { ok: false, reason: "invalid_url" };
    }
  } catch {
    return { ok: false, reason: "invalid_url" };
  }

  return { ok: true, url, apiKey };
}
