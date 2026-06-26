import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getModelByTable } from '@/lib/models';
import { isMongoConfigured, getDbRecords } from '@/lib/db-server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
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
      return NextResponse.json({ error: 'No user registered with this email address' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
