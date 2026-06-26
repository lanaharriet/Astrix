import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { getModelByTable } from '@/lib/models';
import { isMongoConfigured, updateDbRecord } from '@/lib/db-server';

const JWT_SECRET = process.env.JWT_SECRET || 'astrix-super-secret-key-12345';

export async function POST(request: Request) {
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

    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
      }
    } else {
      const success = await updateDbRecord('profiles', payload.id, { password: hashedPassword });
      if (!success) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
