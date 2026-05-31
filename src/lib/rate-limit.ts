// In-memory rate limiter — resets on cold start, but protects against burst abuse
const store = new Map<string, number[]>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const timestamps = (store.get(key) || []).filter(t => now - t < windowMs)
  if (timestamps.length >= limit) return false
  timestamps.push(now)
  store.set(key, timestamps)
  return true
}

export function getIp(req: Request): string {
  const fwd = (req as { headers: Headers }).headers.get('x-forwarded-for')
  return fwd ? fwd.split(',')[0].trim() : 'unknown'
}
