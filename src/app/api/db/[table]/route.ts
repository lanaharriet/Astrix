import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { 
  getDbRecords, 
  insertDbRecord, 
  updateDbRecord, 
  deleteDbRecord 
} from '@/lib/db-server';

const JWT_SECRET = process.env.JWT_SECRET || 'astrix-super-secret-key-12345';

// Helper to verify if the requesting user is an admin
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

// Helper to write auditing logs
async function logAuditAction(
  table: string,
  action: string,
  oldData: any,
  newData: any
) {
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get('astrix-user-session')?.value;
    let userId = 'system';
    if (userSession) {
      userId = JSON.parse(decodeURIComponent(userSession)).id;
    }

    await insertDbRecord('audit_logs', {
      user_id: userId,
      table_name: table,
      action,
      old_data: oldData,
      new_data: newData,
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

// GET: Fetch all records from a table (with optional search param filtering)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const { searchParams } = new URL(request.url);
    let records = await getDbRecords(table);

    // Apply basic query filters
    for (const [key, value] of searchParams.entries()) {
      records = records.filter((rec) => {
        if (rec[key] === undefined) return true;
        return String(rec[key]).toLowerCase() === value.toLowerCase();
      });
    }

    return NextResponse.json(records);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Insert a new record
export async function POST(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    
    // RBAC Security Check
    if (table === 'departments') {
      const isAdmin = await verifyAdmin();
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
      }
    }

    const body = await request.json();
    const newRecord = await insertDbRecord(table, body);

    // Auditing for Departments CRUD
    if (table === 'departments') {
      await logAuditAction('departments', 'CREATE', null, newRecord);
    }

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update an existing record
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    
    // Look for identifier: id or profile_id
    const id = searchParams.get('id') || searchParams.get('profile_id');
    if (!id) {
      return NextResponse.json({ error: 'Missing identifier (id or profile_id) in query params' }, { status: 400 });
    }

    // RBAC Security Check
    if (table === 'departments') {
      const isAdmin = await verifyAdmin();
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
      }
    }

    // Capture old data for auditing
    let oldRecord: any = null;
    if (table === 'departments') {
      const records = await getDbRecords('departments');
      oldRecord = records.find(r => r.id === id);
    }

    const updatedRecord = await updateDbRecord(table, id, body);
    if (!updatedRecord) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // Auditing for Departments CRUD
    if (table === 'departments') {
      await logAuditAction('departments', 'UPDATE', oldRecord, updatedRecord);
    }

    return NextResponse.json(updatedRecord);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Delete a record
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    const { searchParams } = new URL(request.url);
    
    const id = searchParams.get('id') || searchParams.get('profile_id');
    if (!id) {
      return NextResponse.json({ error: 'Missing identifier (id or profile_id) in query params' }, { status: 400 });
    }

    // RBAC Security Check
    if (table === 'departments') {
      const isAdmin = await verifyAdmin();
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
      }
    }

    // Capture old data for auditing
    let oldRecord: any = null;
    if (table === 'departments') {
      const records = await getDbRecords('departments');
      oldRecord = records.find(r => r.id === id);
    }

    const success = await deleteDbRecord(table, id);
    if (!success) {
      return NextResponse.json({ error: 'Record not found or delete failed' }, { status: 404 });
    }

    // Auditing for Departments CRUD
    if (table === 'departments') {
      await logAuditAction('departments', 'DELETE', oldRecord, null);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
