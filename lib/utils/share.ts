import { SITE_URL } from "@/lib/seo/site";

/**
 * Everything about sharing a post that isn't UI: the link it lives at, the
 * text that goes with it, the per-network share URLs, and clipboard access.
 */

export const postPath = (postId: string) => `/post/${postId}`;

/**
 * The origin a shared link should point at: the real domain, except while
 * developing locally, where it must stay on localhost or the link would open
 * a production page that doesn't have the post.
 */
export function getShareOrigin(): string {
  if (
    typeof window !== "undefined" &&
    /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)
  ) {
    return window.location.origin;
  }
  return SITE_URL;
}

export const getPostShareUrl = (postId: string) =>
  `${getShareOrigin()}${postPath(postId)}`;

/** Collapses whitespace and trims to `max` characters on a clean ellipsis. */
export function snippet(text: string, max = 140): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

export interface ShareContext {
  url: string;
  /** Short message that travels with the link. */
  text: string;
  /** Subject line, for email. */
  title: string;
}

const enc = encodeURIComponent;

/**
 * Share URLs for the networks the modal offers. Each opens the network's own
 * composer with the link prefilled — no SDKs, no tracking scripts.
 */
export const shareHrefs = {
  whatsapp: ({ url, text }: ShareContext) =>
    `https://wa.me/?text=${enc(`${text}\n${url}`)}`,
  telegram: ({ url, text }: ShareContext) =>
    `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`,
  x: ({ url, text }: ShareContext) =>
    `https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}`,
  facebook: ({ url }: ShareContext) =>
    `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
  linkedin: ({ url }: ShareContext) =>
    `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
  email: ({ url, text, title }: ShareContext) =>
    `mailto:?subject=${enc(title)}&body=${enc(`${text}\n\n${url}`)}`,
} as const;

export type ShareNetwork = keyof typeof shareHrefs;

/** Opens a network's composer in a small popup (a new tab on mobile). */
export function openShareWindow(href: string) {
  if (href.startsWith("mailto:")) {
    window.location.href = href;
    return;
  }
  const w = 620;
  const h = 680;
  const left = Math.max(0, window.screenX + (window.outerWidth - w) / 2);
  const top = Math.max(0, window.screenY + (window.outerHeight - h) / 2);
  const popup = window.open(
    href,
    "_blank",
    `noopener,noreferrer,width=${w},height=${h},left=${left},top=${top}`,
  );
  // Popup blockers: fall back to a normal navigation in a new tab.
  if (!popup) window.open(href, "_blank", "noopener,noreferrer");
}

/** The browser's native share sheet — present on phones and some desktops. */
export const canNativeShare = () =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";

/**
 * Copies text, falling back to a hidden textarea where the async Clipboard
 * API is unavailable (plain-http pages, older in-app browsers). Resolves
 * false rather than throwing so the caller can tell the user honestly.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}
