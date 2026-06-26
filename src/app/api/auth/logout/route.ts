import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getClientIp } from '@/lib/rate-limit';
import { logAuditEvent } from '@/lib/audit';

const JWT_SECRET = process.env.JWT_SECRET || 'astrix-super-secret-key-12345';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const cookieStore = await cookies();
    const token = cookieStore.get('astrix-token')?.value;
    let userId = null;

    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        userId = payload.id;
      } catch (e) {
        // Token invalid
      }
    }

    if (!userId) {
      const userSession = cookieStore.get('astrix-user-session')?.value;
      if (userSession) {
        try {
          const user = JSON.parse(decodeURIComponent(userSession));
          userId = user.id;
        } catch (e) {}
      }
    }

    cookieStore.set('astrix-token', '', { path: '/', maxAge: 0 });
    cookieStore.set('astrix-user-session', '', { path: '/', maxAge: 0 });

    await logAuditEvent(userId, 'auth_logout', 'SUCCESS', ip);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
