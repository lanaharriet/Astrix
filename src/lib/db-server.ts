import fs from 'fs';
import path from 'path';
import os from 'os';
import dbConnect from './mongodb';
import { getModelByTable } from './models';
import * as seed from './seed-data';

// Determine writable DB path (outside of src to prevent Next.js hot-reload re-compilation)
function getDbFilePath(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY) {
    return path.join(os.tmpdir(), 'local-db.json');
  }
  return path.join(process.cwd(), 'local-db.json');
}

const DB_FILE_PATH = getDbFilePath();

// Check if MongoDB environment variable is set
export function isMongoConfigured(): boolean {
  return !!process.env.MONGODB_URI;
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
    ]
  };
}

// Read from JSON file
export function readLocalDb(): any {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
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
  if (isMongoConfigured()) {
    try {
      await dbConnect();
      const Model = getModelByTable(table);
      if (Model) {
        const docs = await Model.find({}).lean();
        return docs.map((doc: any) => {
          const mapped = { ...doc, id: doc._id };
          delete mapped._id;
          delete mapped.__v;
          return mapped;
        });
      }
    } catch (err) {
      console.warn(`MongoDB read failed on table ${table}, falling back to local DB:`, err);
    }
  }

  // Fallback to local DB
  const db = readLocalDb();
  return db[table] || [];
}

export async function insertDbRecord(table: string, record: any): Promise<any> {
  const recordId = record.id || record._id || `rec-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  
  const prepared = {
    ...record,
    created_at: record.created_at || timestamp,
  };

  if (isMongoConfigured()) {
    try {
      await dbConnect();
      const Model = getModelByTable(table);
      if (Model) {
        const docData = { ...prepared, _id: recordId };
        delete docData.id;
        
        // Hash passwords for profiles if needed
        if (table === 'profiles' && docData.password && !docData.password.startsWith('$2a$')) {
          const bcrypt = require('bcryptjs');
          docData.password = await bcrypt.hash(docData.password, 12);
        }

        const doc = await Model.create(docData);
        const result = doc.toObject();
        const mapped = { ...result, id: result._id };
        delete mapped._id;
        delete mapped.__v;
        return mapped;
      }
    } catch (err) {
      console.warn(`MongoDB insert failed on table ${table}, falling back to local DB:`, err);
    }
  }

  // Fallback to local DB
  const db = readLocalDb();
  if (!db[table]) db[table] = [];
  const localPrepared = { ...prepared, id: recordId };
  db[table].push(localPrepared);
  writeLocalDb(db);
  return localPrepared;
}

export async function updateDbRecord(table: string, id: string, updates: any): Promise<any> {
  if (isMongoConfigured()) {
    try {
      await dbConnect();
      const Model = getModelByTable(table);
      if (Model) {
        const keyField = (table === 'students' || table === 'faculty' || table === 'parents') ? 'profile_id' : '_id';
        
        const docUpdates = { ...updates };
        if (table === 'profiles' && docUpdates.password && !docUpdates.password.startsWith('$2a$')) {
          const bcrypt = require('bcryptjs');
          docUpdates.password = await bcrypt.hash(docUpdates.password, 12);
        }

        const doc = await Model.findOneAndUpdate(
          { [keyField]: id },
          { $set: docUpdates },
          { new: true }
        ).lean();

        if (doc) {
          const mapped = { ...doc, id: doc._id };
          delete mapped._id;
          delete mapped.__v;
          return mapped;
        }
      }
    } catch (err) {
      console.warn(`MongoDB update failed on table ${table}, falling back to local DB:`, err);
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
  if (isMongoConfigured()) {
    try {
      await dbConnect();
      const Model = getModelByTable(table);
      if (Model) {
        const keyField = (table === 'students' || table === 'faculty' || table === 'parents') ? 'profile_id' : '_id';
        const res = await Model.deleteOne({ [keyField]: id });
        return res.deletedCount > 0;
      }
    } catch (err) {
      console.warn(`MongoDB delete failed on table ${table}, falling back to local DB:`, err);
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
