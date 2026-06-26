import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { getModelByTable } from '@/lib/models';
import { isMongoConfigured, getDbRecords } from '@/lib/db-server';

const JWT_SECRET = process.env.JWT_SECRET || 'astrix-super-secret-key-12345';

export async function GET() {
  try {
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

    let user: any = null;

    if (isMongoConfigured()) {
      await dbConnect();
      const UserModel = getModelByTable('profiles');
      if (UserModel) {
        user = await UserModel.findById(payload.id).lean();
      }
    } else {
      const profiles = await getDbRecords('profiles');
      user = profiles.find((p: any) => p.id === payload.id);
    }

    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
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

    return NextResponse.json(profile);
  } catch (error: any) {
    const { trackApiFailure } = require('@/lib/monitor');
    trackApiFailure('/api/auth/me', error);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
