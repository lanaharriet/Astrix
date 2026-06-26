import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { getModelByTable } from '@/lib/models';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { logAuditEvent } from '@/lib/audit';
import { isMongoConfigured, getDbRecords } from '@/lib/db-server';

const JWT_SECRET = process.env.JWT_SECRET || 'astrix-super-secret-key-12345';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    // 1. IP Rate Limiting: 10 attempts / 15 minutes
    const ip = getClientIp(request);
    const isAllowed = checkRateLimit(ip, 10, 900000);
    if (!isAllowed) {
      await logAuditEvent(null, 'security_rate_limit_violation', 'FAILED', ip, { endpoint: '/api/auth/login' });
      return NextResponse.json(
        { error: 'Too Many Requests: Rate limit exceeded. Please try again after 15 minutes.' },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 2. Input Validation
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Validation Error: Invalid email format' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Validation Error: Password must be at least 8 characters' }, { status: 400 });
    }

    let user: any = null;

    if (isMongoConfigured()) {
      await dbConnect();
      const UserModel = getModelByTable('profiles');
      if (UserModel) {
        user = await UserModel.findOne({ email }).lean();
      }
    } else {
      const profiles = await getDbRecords('profiles');
      user = profiles.find((p: any) => p.email === email);
    }

    if (!user) {
      await logAuditEvent(null, 'auth_login', 'FAILED', ip, { email, reason: 'Email not registered' });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    let isPasswordValid = false;
    if (user.password) {
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isPasswordValid = await bcrypt.compare(password, user.password);
      } else {
        // Fallback for plaintext passwords in mock seed data
        isPasswordValid = (password === user.password);
      }
    }

    if (!isPasswordValid) {
      await logAuditEvent(null, 'auth_login', 'FAILED', ip, { email, reason: 'Incorrect password' });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const profile = {
      id: user._id || user.id,
      name: user.fullName || user.name || '',
      full_name: user.fullName || user.name || '',
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      avatar_url: user.avatar || user.avatar_url,
    };

    // Sign JWT
    const token = jwt.sign(
      { id: profile.id, email: profile.email, role: profile.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('astrix-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    const cookieVal = encodeURIComponent(JSON.stringify(profile));
    cookieStore.set('astrix-user-session', cookieVal, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    await logAuditEvent(profile.id, 'auth_login', 'SUCCESS', ip, { email: profile.email });

    return NextResponse.json(profile);
  } catch (error: any) {
    const { trackApiFailure } = require('@/lib/monitor');
    trackApiFailure('/api/auth/login', error);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
