import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { getModelByTable } from '@/lib/models';
import { isMongoConfigured, updateDbRecord } from '@/lib/db-server';
import { getClientIp } from '@/lib/rate-limit';
import { logAuditEvent } from '@/lib/audit';

const JWT_SECRET = process.env.JWT_SECRET || 'astrix-super-secret-key-12345';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const cookieStore = await cookies();
    const token = cookieStore.get('astrix-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    if (isMongoConfigured()) {
      await dbConnect();
      const UserModel = getModelByTable('profiles');
      if (UserModel) {
        const updatedUser = await UserModel.findByIdAndUpdate(
          payload.id,
          { $set: { password: hashedPassword } },
          { new: true }
        );
        if (!updatedUser) {
          await logAuditEvent(payload.id, 'auth_password_change', 'FAILED', ip, { reason: 'User not found in MongoDB' });
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
      }
    } else {
      const success = await updateDbRecord('profiles', payload.id, { password: hashedPassword });
      if (!success) {
        await logAuditEvent(payload.id, 'auth_password_change', 'FAILED', ip, { reason: 'User not found in local DB' });
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    await logAuditEvent(payload.id, 'auth_password_change', 'SUCCESS', ip);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const { trackApiFailure } = require('@/lib/monitor');
    trackApiFailure('/api/auth/update-password', error);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
