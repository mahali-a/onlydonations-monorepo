import { customAlphabet, nanoid } from "nanoid";

const URL_SAFE_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

let _urlId: (() => string) | null = null;

/**
 * URL-safe ID generator (no hyphens or underscores)
 * Use for IDs that appear in URLs to prevent truncation issues
 * Lazily initialized to avoid issues in Worker environments
 */
export function urlId(): string {
  if (!_urlId) {
    _urlId = customAlphabet(URL_SAFE_ALPHABET, 21);
  }
  return _urlId();
}

/**
 * Standard ID generator (includes hyphens/underscores)
 * Use for internal IDs not exposed in URLs
 */
export { nanoid };
