import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import { getModelByTable } from '@/lib/models';
import { isMongoConfigured, getDbRecords, insertDbRecord, updateDbRecord, deleteDbRecord } from '@/lib/db-server';

const JWT_SECRET = process.env.JWT_SECRET || 'astrix-super-secret-key-12345';

// Helper to verify admin
async function verifyAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('astrix-token')?.value;
    
    if (!token) {
      // Fallback for mock mode check via astrix-user-session cookie
      const userSession = cookieStore.get('astrix-user-session')?.value;
      if (userSession) {
        const user = JSON.parse(decodeURIComponent(userSession));
        return user && user.role === 'admin';
      }
      return false;
    }
    
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload && payload.role === 'admin';
  } catch (e) {
    return false;
  }
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new department (admin only)
export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, description } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
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

    await logAuditAction('CREATE', null, newRecord);

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update an existing department (admin only)
export async function PUT(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
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

    const updatedRecord = await updateDbRecord('departments', id, body);
    await logAuditAction('UPDATE', oldRecord, updatedRecord);

    return NextResponse.json(updatedRecord);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Delete a department (admin only)
export async function DELETE(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
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

    await logAuditAction('DELETE', oldRecord, null);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
