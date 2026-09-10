const VISITOR_KEY = "jw_visitor_id";

export type TrackType = "page_view" | "whatsapp_click" | "product_view";

export function getVisitorId(): string {
  try {
    let id = sessionStorage.getItem(VISITOR_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function classifySource(referrer: string): string {
  if (!referrer) return "Directo";
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (/instagram/.test(host)) return "Instagram";
    if (/(facebook|fb\.me|meta\.)/.test(host)) return "Facebook";
    if (/(google|bing|yahoo|duckduckgo)/.test(host)) return "Buscadores";
    if (/(wa\.me|whatsapp)/.test(host)) return "WhatsApp";
    if (/t\.me|telegram/.test(host)) return "Telegram";
    if (/tiktok/.test(host)) return "TikTok";
    if (/(x\.com|twitter)/.test(host)) return "X (Twitter)";
    if (/pinterest/.test(host)) return "Pinterest";
    if (/youtube/.test(host)) return "YouTube";
    if (host === window.location.hostname) return "Interno";
    return "Otro";
  } catch {
    return "Directo";
  }
}

export function trackEvent(
  tipo: TrackType,
  path: string,
  fuente?: string
): void {
  try {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo,
        path,
        fuente,
        visitanteId: getVisitorId(),
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // silencioso: nunca debe romper la UX
  }
}