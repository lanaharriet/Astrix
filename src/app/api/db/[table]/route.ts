import { NextResponse } from 'next/server';
import { getDbRecords, insertDbRecord, updateDbRecord, deleteDbRecord } from '@/lib/db-server';

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
    const body = await request.json();
    const newRecord = await insertDbRecord(table, body);
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

    const updatedRecord = await updateDbRecord(table, id, body);
    if (!updatedRecord) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
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

    const success = await deleteDbRecord(table, id);
    if (!success) {
      return NextResponse.json({ error: 'Record not found or delete failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
