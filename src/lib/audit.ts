import { insertDbRecord } from './db-server';

/**
 * Enterprise Auditing Helper.
 * Automatically logs authentication, admin, security, and AI usage events to MongoDB or local DB.
 * Guaranteed never to crash the calling thread or transaction on logging failure.
 */
export async function logAuditEvent(
  userId: string | null,
  action: string,
  status: string,
  ipAddress: string,
  metadata?: any
) {
  try {
    const event = {
      userId: userId || 'system',
      user_id: userId || 'system', // backward compatibility
      action,
      status,
      ipAddress: ipAddress || '127.0.0.1',
      metadata: metadata || {},
      timestamp: new Date(),
      table_name: 'security_audit', // backward compatibility
    };

    // Safely insert using the database server router
    await insertDbRecord('audit_logs', event);
    console.log(`[AuditLog] logged: action="${action}" status="${status}" user="${userId || 'system'}" ip="${ipAddress || '127.0.0.1'}"`);
  } catch (err) {
    // Never allow audit logging failures to crash the application
    console.error('Failed to log audit event:', err);
  }
}
