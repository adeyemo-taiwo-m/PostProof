type Entry = { count: number; resetAt: number };
const memory = new Map<string, Entry>();

export async function checkSubmissionRateLimit(key: string) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (redisUrl && redisToken) {
    try {
      const response = await fetch(`${redisUrl}/incr/testimonial:${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${redisToken}` }, cache: "no-store" });
      const result = await response.json() as { result?: number };
      if (result.result === 1) await fetch(`${redisUrl}/expire/testimonial:${encodeURIComponent(key)}/3600`, { headers: { Authorization: `Bearer ${redisToken}` }, cache: "no-store" });
      return { allowed: (result.result ?? 0) <= 8, retryAfter: 3600 };
    } catch {
      // A temporary Redis failure falls back to the local guard rather than blocking collection.
    }
  }
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.resetAt < now) { memory.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 }); return { allowed: true, retryAfter: 3600 }; }
  entry.count += 1;
  return { allowed: entry.count <= 8, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
}
