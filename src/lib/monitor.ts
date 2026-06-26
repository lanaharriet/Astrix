/**
 * Enterprise Application Monitoring & Telemetry Utility.
 * Logs structured warnings to the server console for quick diagnostics
 * while ensuring internal implementation details (tokens, URIs, stack traces)
 * are never leaked publicly.
 */

export function trackApiFailure(endpoint: string, error: any) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[MONITOR] [API_FAILURE] endpoint="${endpoint}" error="${message}" timestamp="${new Date().toISOString()}"`);
}

export function trackAuthFailure(email: string, reason: string) {
  // Mask email prefix to preserve privacy in logging streams
  const maskedEmail = email ? email.replace(/(..)(.*)(@.*)/, '$1***$3') : 'unknown';
  console.warn(`[MONITOR] [AUTH_FAILURE] user="${maskedEmail}" reason="${reason}" timestamp="${new Date().toISOString()}"`);
}

export function trackAiFailure(action: string, error: any) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[MONITOR] [AI_FAILURE] action="${action}" error="${message}" timestamp="${new Date().toISOString()}"`);
}

export function trackDbFailure(operation: string, error: any) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[MONITOR] [DATABASE_FAILURE] operation="${operation}" error="${message}" timestamp="${new Date().toISOString()}"`);
}
