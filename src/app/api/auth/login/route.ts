import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { getModelByTable } from '@/lib/models';
import { isMongoConfigured, getDbRecords } from '@/lib/db-server';

const JWT_SECRET = process.env.JWT_SECRET || 'astrix-super-secret-key-12345';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
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
      { expiresIn: '1d' }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('astrix-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400 // 1 day
    });

    const cookieVal = encodeURIComponent(JSON.stringify(profile));
    cookieStore.set('astrix-user-session', cookieVal, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400 // 1 day
    });

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
