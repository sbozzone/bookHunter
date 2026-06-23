import { headers } from 'next/headers';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const entries = new Map<string, RateLimitEntry>();
const MAX_TRACKED_CLIENTS = 2_000;

function pruneExpiredEntries(now: number) {
  for (const [key, entry] of entries) {
    if (entry.resetAt <= now) entries.delete(key);
  }

  while (entries.size > MAX_TRACKED_CLIENTS) {
    const oldestKey = entries.keys().next().value;
    if (!oldestKey) break;
    entries.delete(oldestKey);
  }
}

/**
 * Lightweight, best-effort protection for the public server actions.
 *
 * A distributed limiter should replace this when the app runs on more than one
 * server instance, but this still prevents a single client from repeatedly
 * exhausting the upstream book APIs on an individual instance.
 */
export async function consumeRateLimit(
  scope: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get('x-forwarded-for');
  const client = forwardedFor?.split(',')[0]?.trim() || requestHeaders.get('x-real-ip') || 'unknown';
  const key = `${scope}:${client}`;
  const now = Date.now();
  const existing = entries.get(key);

  if (!existing || existing.resetAt <= now) {
    entries.set(key, { count: 1, resetAt: now + windowMs });
    pruneExpiredEntries(now);
    return true;
  }

  if (existing.count >= maxRequests) return false;

  existing.count += 1;
  return true;
}
