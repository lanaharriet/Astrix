import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { getModelByTable } from '@/lib/models';
import { isMongoConfigured, getDbRecords, insertDbRecord, updateDbRecord, deleteDbRecord } from '@/lib/db-server';
import { getClientIp } from '@/lib/rate-limit';
import { logAuditEvent } from '@/lib/audit';

const JWT_SECRET = process.env.JWT_SECRET || 'astrix-super-secret-key-12345';

// Helper to verify admin and get requester details
async function getRequester(request: Request) {
  const ip = getClientIp(request);
  let userId = null;
  let isAdmin = false;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('astrix-token')?.value;
    
    if (token) {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      userId = payload.id;
      isAdmin = payload.role === 'admin';
    } else {
      const userSession = cookieStore.get('astrix-user-session')?.value;
      if (userSession) {
        const user = JSON.parse(decodeURIComponent(userSession));
        userId = user.id || user._id;
        isAdmin = user.role === 'admin';
      }
    }
  } catch (e) {}
  return { userId, ip, isAdmin };
}

// Helper to log audit actions
async function logAuditAction(action: string, oldData: any, newData: any) {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get('astrix-user-session')?.value;
    let userId = 'system';
    if (userSession) {
      userId = JSON.parse(decodeURIComponent(userSession)).id;
    }

    await insertDbRecord('audit_logs', {
      user_id: userId,
      table_name: 'departments',
      action,
      old_data: oldData,
      new_data: newData,
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

// GET: Fetch all departments (support search query, pagination, etc.)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let departments = await getDbRecords('departments');

    // Filter by search query
    if (search) {
      const query = search.toLowerCase();
      departments = departments.filter((d: any) => 
        d.name.toLowerCase().includes(query) ||
        d.code.toLowerCase().includes(query) ||
        (d.description && d.description.toLowerCase().includes(query))
      );
    }

    // Apply pagination
    const total = departments.length;
    const startIndex = (page - 1) * limit;
    const paginated = departments.slice(startIndex, startIndex + limit);

    return NextResponse.json(paginated);
  } catch (error: any) {
    const { trackApiFailure } = require('@/lib/monitor');
    trackApiFailure('/api/departments (GET)', error);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}

// POST: Create a new department (admin only)
export async function POST(request: Request) {
  try {
    const { userId, ip, isAdmin } = await getRequester(request);
    if (!isAdmin) {
      await logAuditEvent(userId, 'security_unauthorized_access', 'FAILED', ip, { endpoint: '/api/departments', method: 'POST' });
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, description } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }

    // Code syntax constraint: 2-10 alphanumeric characters or hyphens
    const DEPT_CODE_REGEX = /^[A-Z0-9-]{2,10}$/i;
    if (!DEPT_CODE_REGEX.test(code)) {
      return NextResponse.json({ error: 'Validation Error: Department code must be 2-10 alphanumeric characters or hyphens' }, { status: 400 });
    }

    // Check if code already exists
    const departments = await getDbRecords('departments');
    const existing = departments.find((d: any) => d.code === code.toUpperCase());
    if (existing) {
      return NextResponse.json({ error: `Department with code ${code.toUpperCase()} already exists` }, { status: 400 });
    }

    const newRecord = await insertDbRecord('departments', {
      id: `d-${code.toLowerCase()}`,
      name,
      code: code.toUpperCase(),
      description
    });

    await logAuditEvent(userId, 'create_department', 'SUCCESS', ip, { code: code.toUpperCase(), name });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error: any) {
    const { trackApiFailure } = require('@/lib/monitor');
    trackApiFailure('/api/departments (POST)', error);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}

// PUT: Update an existing department (admin only)
export async function PUT(request: Request) {
  try {
    const { userId, ip, isAdmin } = await getRequester(request);
    if (!isAdmin) {
      await logAuditEvent(userId, 'security_unauthorized_access', 'FAILED', ip, { endpoint: '/api/departments', method: 'PUT' });
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing department id in query params' }, { status: 400 });
    }

    const body = await request.json();
    const departments = await getDbRecords('departments');
    const oldRecord = departments.find((d: any) => d.id === id);
    if (!oldRecord) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // If updating code, validate syntax and uniqueness
    const { code } = body;
    if (code) {
      const DEPT_CODE_REGEX = /^[A-Z0-9-]{2,10}$/i;
      if (!DEPT_CODE_REGEX.test(code)) {
        return NextResponse.json({ error: 'Validation Error: Department code must be 2-10 alphanumeric characters or hyphens' }, { status: 400 });
      }
      const existing = departments.find((d: any) => d.code === code.toUpperCase() && d.id !== id);
      if (existing) {
        return NextResponse.json({ error: `Department with code ${code.toUpperCase()} already exists` }, { status: 400 });
      }
    }

    const updatedRecord = await updateDbRecord('departments', id, body);
    await logAuditEvent(userId, 'update_department', 'SUCCESS', ip, { id, code: code || oldRecord.code, name: body.name || oldRecord.name });

    return NextResponse.json(updatedRecord);
  } catch (error: any) {
    const { trackApiFailure } = require('@/lib/monitor');
    trackApiFailure('/api/departments (PUT)', error);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}

// DELETE: Delete a department (admin only)
export async function DELETE(request: Request) {
  try {
    const { userId, ip, isAdmin } = await getRequester(request);
    if (!isAdmin) {
      await logAuditEvent(userId, 'security_unauthorized_access', 'FAILED', ip, { endpoint: '/api/departments', method: 'DELETE' });
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing department id in query params' }, { status: 400 });
    }

    const departments = await getDbRecords('departments');
    const oldRecord = departments.find((d: any) => d.id === id);
    if (!oldRecord) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    const success = await deleteDbRecord('departments', id);
    if (!success) {
      return NextResponse.json({ error: 'Delete operation failed' }, { status: 500 });
    }

    await logAuditEvent(userId, 'delete_department', 'SUCCESS', ip, { id, code: oldRecord.code, name: oldRecord.name });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const { trackApiFailure } = require('@/lib/monitor');
    trackApiFailure('/api/departments (DELETE)', error);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
