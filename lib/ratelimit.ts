// ══════════════════════════════════════════
// lib/ratelimit.ts
// ══════════════════════════════════════════

const requests = new Map<string, number[]>()

export function checkRateLimit(identifier: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const times = requests.get(identifier) || []

  // Remove old requests outside the window
  const recentRequests = times.filter(t => now - t < windowMs)

  if (recentRequests.length >= limit) {
    return false // Rate limit exceeded
  }

  recentRequests.push(now)
  requests.set(identifier, recentRequests)
  return true
}

export function getRateLimitHeaders(identifier: string, limit = 10, windowMs = 60000) {
  const now = Date.now()
  const times = requests.get(identifier) || []
  const recentRequests = times.filter(t => now - t < windowMs)
  const remaining = Math.max(0, limit - recentRequests.length)

  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(now + windowMs).toISOString(),
  }
}
