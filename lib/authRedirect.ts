export function safeAuthReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/";
  }

  try {
    const url = new URL(value, "https://sharda.social");
    return url.origin === "https://sharda.social"
      ? `${url.pathname}${url.search}${url.hash}`
      : "/";
  } catch {
    return "/";
  }
}

export function getCurrentAuthReturnTo(): string {
  if (typeof window === "undefined") return "/";
  return safeAuthReturnTo(`${window.location.pathname}${window.location.search}${window.location.hash}`);
}

export function getLoginUrl(returnTo?: string): string {
  const target = safeAuthReturnTo(returnTo ?? getCurrentAuthReturnTo());
  return `/auth/login?next=${encodeURIComponent(target)}`;
}
