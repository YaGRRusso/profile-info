import { lookup } from "mime-types";

const ACCEPTABLE_PROTOCOLS = new Set(["http:", "https:"]);

const ACCEPTABLE_TYPES = new Set([
  "text/html",
  "application/xhtml+xml",
  "application/x-httpd-php",
]);

export function isWebpageUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    if (!ACCEPTABLE_PROTOCOLS.has(url.protocol)) return false;

    const type = lookup(url.pathname);
    if (!type) return true;

    return ACCEPTABLE_TYPES.has(type);
  } catch {
    return false;
  }
}
