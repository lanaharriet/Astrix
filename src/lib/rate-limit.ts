type RateLimitRecord = {
  timestamps: number[];
};

const limiters = new Map<string, RateLimitRecord>();

/**
 * Checks if the request should be rate-limited
 * @param ip Client IP address
 * @param limit Max number of requests allowed in window
 * @param windowMs Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  let record = limiters.get(ip);
  if (!record) {
    record = { timestamps: [] };
    limiters.set(ip, record);
  }

  // Filter timestamps within the active time window
  record.timestamps = record.timestamps.filter(t => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    return false;
  }

  record.timestamps.push(now);
  return true;
}

/**
 * Helper to extract IP address from request headers
 */
export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  return '127.0.0.1';
}
