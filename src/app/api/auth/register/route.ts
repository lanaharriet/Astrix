import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { getModelByTable } from '@/lib/models';
import { isMongoConfigured, getDbRecords, insertDbRecord } from '@/lib/db-server';
import { getClientIp } from '@/lib/rate-limit';
import { logAuditEvent } from '@/lib/audit';

const JWT_SECRET = process.env.JWT_SECRET || 'astrix-super-secret-key-12345';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLE_WHITELIST = ['student', 'faculty', 'parent', 'admin'];

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { email, password, name, role } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Validation Error: Invalid email format' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Validation Error: Password must be at least 8 characters' }, { status: 400 });
    }

    if (!ROLE_WHITELIST.includes(role)) {
      return NextResponse.json({ error: 'Validation Error: Invalid role assignment' }, { status: 400 });
    }

    let existing: any = null;

    if (isMongoConfigured()) {
      await dbConnect();
      const UserModel = getModelByTable('profiles');
      if (UserModel) {
        existing = await UserModel.findOne({ email });
      }
    } else {
      const profiles = await getDbRecords('profiles');
      existing = profiles.find((p: any) => p.email === email);
    }

    if (existing) {
      await logAuditEvent(null, 'auth_register', 'FAILED', ip, { email, role, reason: 'Email already registered' });
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = `u-${role}-${Math.random().toString(36).substr(2, 9)}`;

    let newUser: any = null;

    if (isMongoConfigured()) {
      await dbConnect();
      const UserModel = getModelByTable('profiles');
      const StudentModel = getModelByTable('students');
      const FacultyModel = getModelByTable('faculty');
      const ParentModel = getModelByTable('parents');

      if (!UserModel) {
        return NextResponse.json({ error: 'User model not found' }, { status: 500 });
      }

      newUser = await UserModel.create({
        _id: userId,
        fullName: name,
        email,
        password: hashedPassword,
        role,
        isActive: true,
        avatar: `https://images.unsplash.com/photo-${role === 'admin' ? '1494790108377-be9c29b29330' : '1535713875002-d1d0cf377fde'}?auto=format&fit=crop&q=80&w=120`,
      });

      if (role === 'student' && StudentModel) {
        await StudentModel.create({
          profile_id: userId,
          register_number: `REG${Math.floor(100000 + Math.random() * 900000)}`,
          department_id: 'd-cse',
          year: 1,
          semester: 1,
          cgpa: 0.00
        });
      } else if (role === 'faculty' && FacultyModel) {
        await FacultyModel.create({
          profile_id: userId,
          faculty_id: `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
          department_id: 'd-cse',
          designation: 'Assistant Professor'
        });
      } else if (role === 'parent' && ParentModel) {
        await ParentModel.create({
          profile_id: userId,
          student_id: 'u-student-1',
          relation: 'Parent'
        });
      }
    } else {
      newUser = await insertDbRecord('profiles', {
        id: userId,
        name,
        full_name: name,
        email,
        password: hashedPassword,
        role,
        avatar_url: `https://images.unsplash.com/photo-${role === 'admin' ? '1494790108377-be9c29b29330' : '1535713875002-d1d0cf377fde'}?auto=format&fit=crop&q=80&w=120`,
      });

      if (role === 'student') {
        await insertDbRecord('students', {
          profile_id: userId,
          register_number: `REG${Math.floor(100000 + Math.random() * 900000)}`,
          department_id: 'd-cse',
          year: 1,
          semester: 1,
          cgpa: 0.00
        });
      } else if (role === 'faculty') {
        await insertDbRecord('faculty', {
          profile_id: userId,
          faculty_id: `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
          department_id: 'd-cse',
          designation: 'Assistant Professor'
        });
      } else if (role === 'parent') {
        await insertDbRecord('parents', {
          profile_id: userId,
          student_id: 'u-student-1',
          relation: 'Parent'
        });
      }
    }

    const profile = {
      id: newUser._id || newUser.id,
      name: newUser.fullName || newUser.name || name,
      full_name: newUser.fullName || newUser.name || name,
      email: newUser.email,
      role: newUser.role,
      avatar_url: newUser.avatar || newUser.avatar_url,
    };

    // Sign JWT
    const token = jwt.sign(
      { id: profile.id, email: profile.email, role: profile.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookies
    const cookieStore = await cookies();
    cookieStore.set('astrix-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    const cookieVal = encodeURIComponent(JSON.stringify(profile));
    cookieStore.set('astrix-user-session', cookieVal, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    await logAuditEvent(profile.id, 'auth_register', 'SUCCESS', ip, { email: profile.email, role: profile.role });

    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    const { trackApiFailure } = require('@/lib/monitor');
    trackApiFailure('/api/auth/register', error);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
