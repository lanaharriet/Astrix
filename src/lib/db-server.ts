import fs from 'fs';
import path from 'path';
import os from 'os';
import { createClient as createSupabaseServerClient } from './supabase/server';
import * as seed from './seed-data';

// Determine writable DB path (outside of src to prevent Next.js hot-reload re-compilation)
function getDbFilePath(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY) {
    return path.join(os.tmpdir(), 'local-db.json');
  }
  return path.join(process.cwd(), 'local-db.json');
}

const DB_FILE_PATH = getDbFilePath();

// Check if Supabase env vars are set
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-url.supabase.co'
  );
}

// Get initial database state
function getInitialDbState() {
  return {
    profiles: seed.SEED_PROFILES,
    departments: seed.SEED_DEPARTMENTS,
    students: seed.SEED_STUDENTS,
    faculty: seed.SEED_FACULTY,
    parents: seed.SEED_PARENTS,
    courses: seed.SEED_COURSES,
    subjects: seed.SEED_SUBJECTS,
    attendance: seed.SEED_ATTENDANCE,
    exams: seed.SEED_EXAMS,
    results: seed.SEED_RESULTS,
    fees: seed.SEED_FEES,
    payments: seed.SEED_PAYMENTS,
    leave_requests: seed.SEED_LEAVE_REQUESTS,
    certificate_requests: seed.SEED_CERTIFICATE_REQUESTS,
    grievances: seed.SEED_GRIEVANCES,
    notices: seed.SEED_NOTICES,
    placements: seed.SEED_PLACEMENTS,
    placement_applications: seed.SEED_PLACEMENT_APPLICATIONS,
    interviews: seed.SEED_INTERVIEWS,
    campus_locations: seed.SEED_CAMPUS_LOCATIONS,
    assignments: seed.SEED_ASSIGNMENTS,
    submissions: seed.SEED_SUBMISSIONS,
    notes: seed.SEED_NOTES,
    system_settings: seed.SEED_SYSTEM_SETTINGS,
    timetables: seed.SEED_TIMETABLES,
    timetable_entries: seed.SEED_TIMETABLE_ENTRIES,
    messages: [] as any[],
    notifications: [] as any[],
    ai_chat_history: [] as any[],
    activity_logs: [] as any[],
    audit_logs: [] as any[],
    skills: [
      { id: 'sk-1', name: 'React & Next.js', category: 'Technical' },
      { id: 'sk-2', name: 'Python & PyTorch', category: 'Technical' },
      { id: 'sk-3', name: 'SQL & Database Design', category: 'Technical' },
      { id: 'sk-4', name: 'Public Speaking', category: 'Soft Skill' },
    ],
    student_skills: [
      { student_id: 'u-student-1', skill_id: 'sk-1', proficiency_level: 'Advanced' },
      { student_id: 'u-student-1', skill_id: 'sk-3', proficiency_level: 'Intermediate' },
      { student_id: 'u-student-2', skill_id: 'sk-2', proficiency_level: 'Advanced' },
    ],
    resume_uploads: [] as any[],
    achievements: [
      { id: 'ach-1', student_id: 'u-student-1', title: 'Smart India Hackathon Winner', description: 'First prize in smart education category.', date: '2026-03-12', category: 'Hackathon' },
    ] as any[]
  };
}

// Read from JSON file
export function readLocalDb(): any {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      // Check if there is an existing local-db.json in src/lib/ to migrate
      const oldPath = path.join(process.cwd(), 'src', 'lib', 'local-db.json');
      if (fs.existsSync(oldPath)) {
        try {
          const fileContent = fs.readFileSync(oldPath, 'utf-8');
          fs.writeFileSync(DB_FILE_PATH, fileContent, 'utf-8');
          return JSON.parse(fileContent);
        } catch (e) {
          console.warn('Could not migrate old DB file, using seed data:', e);
        }
      }
      const initialState = getInitialDbState();
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialState, null, 2), 'utf-8');
      return initialState;
    }
    const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading local DB file:', error);
    return getInitialDbState();
  }
}

// Write to JSON file
export function writeLocalDb(data: any): void {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing local DB file:', error);
  }
}

// Unified CRUD server helpers
export async function getDbRecords(table: string): Promise<any[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from(table).select('*');
      if (!error && data) return data;
      console.warn(`Supabase read error on table ${table}, falling back to local DB:`, error);
    } catch (err) {
      console.warn(`Supabase connection failed, falling back to local DB:`, err);
    }
  }

  // Fallback to local DB
  const db = readLocalDb();
  return db[table] || [];
}

export async function insertDbRecord(table: string, record: any): Promise<any> {
  // Ensure we add an ID if it's missing
  const newRecord = {
    id: record.id || `rec-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    ...record,
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.from(table).insert([newRecord]).select();
      if (!error && data) return data[0];
      console.warn(`Supabase insert error on table ${table}, falling back to local DB:`, error);
    } catch (err) {
      console.warn(`Supabase connection failed, falling back to local DB:`, err);
    }
  }

  // Fallback to local DB
  const db = readLocalDb();
  if (!db[table]) db[table] = [];
  db[table].push(newRecord);
  writeLocalDb(db);
  return newRecord;
}

export async function updateDbRecord(table: string, id: string, updates: any): Promise<any> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      
      // Profiles are matched by 'id'
      // Students and Faculty tables use 'profile_id' as PK
      // Let's identify the correct key column
      const keyColumn = (table === 'students' || table === 'faculty' || table === 'parents') ? 'profile_id' : 'id';
      
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq(keyColumn, id)
        .select();
        
      if (!error && data) return data[0];
      console.warn(`Supabase update error on table ${table}, falling back to local DB:`, error);
    } catch (err) {
      console.warn(`Supabase connection failed, falling back to local DB:`, err);
    }
  }

  // Fallback to local DB
  const db = readLocalDb();
  if (!db[table]) db[table] = [];
  
  const keyField = (table === 'students' || table === 'faculty' || table === 'parents') ? 'profile_id' : 'id';
  const index = db[table].findIndex((item: any) => item[keyField] === id);
  
  if (index !== -1) {
    db[table][index] = { ...db[table][index], ...updates, updated_at: new Date().toISOString() };
    writeLocalDb(db);
    return db[table][index];
  }
  return null;
}

export async function deleteDbRecord(table: string, id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const keyColumn = (table === 'students' || table === 'faculty' || table === 'parents') ? 'profile_id' : 'id';
      const { error } = await supabase.from(table).delete().eq(keyColumn, id);
      if (!error) return true;
      console.warn(`Supabase delete error on table ${table}, falling back to local DB:`, error);
    } catch (err) {
      console.warn(`Supabase connection failed, falling back to local DB:`, err);
    }
  }

  // Fallback to local DB
  const db = readLocalDb();
  if (!db[table]) return false;
  
  const keyField = (table === 'students' || table === 'faculty' || table === 'parents') ? 'profile_id' : 'id';
  const initialLength = db[table].length;
  db[table] = db[table].filter((item: any) => item[keyField] !== id);
  writeLocalDb(db);
  return db[table].length < initialLength;
}
