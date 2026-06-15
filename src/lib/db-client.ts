// Type-safe client-side database helper
// Communicates with /api/db/[table] to fetch and modify data

async function fetchApi(url: string, options?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    throw error;
  }
}

class TableClient<T = any> {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // Fetch all records, optional query parameters
  async select(filters?: Record<string, string | number | boolean>): Promise<T[]> {
    let url = `/api/db/${this.tableName}`;
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        params.append(key, String(val));
      });
      url += `?${params.toString()}`;
    }
    
    let serverRecords: T[] = [];
    try {
      serverRecords = await fetchApi(url);
    } catch (e) {
      console.warn("Server DB fetch failed, using client storage cache");
    }

    // Merge with client-side cache
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`astrix-db-${this.tableName}`);
      if (cached) {
        const cachedRecords = JSON.parse(cached);
        const merged = [...serverRecords];
        const keyField = (this.tableName === 'students' || this.tableName === 'faculty' || this.tableName === 'parents') ? 'profile_id' : 'id';
        cachedRecords.forEach((cRec: any) => {
          if (!merged.some((sRec: any) => sRec[keyField] === cRec[keyField])) {
            merged.push(cRec);
          }
        });
        serverRecords = merged as T[];
      }
    }

    // Apply manual filters
    if (filters) {
      return serverRecords.filter((rec: any) => {
        return Object.entries(filters).every(([key, val]) => {
          if (rec[key] === undefined) return true;
          return String(rec[key]).toLowerCase() === String(val).toLowerCase();
        });
      });
    }

    return serverRecords;
  }

  // Insert a new record
  async insert(record: Partial<T>): Promise<T> {
    const url = `/api/db/${this.tableName}`;
    
    // Ensure ID exists
    const keyField = (this.tableName === 'students' || this.tableName === 'faculty' || this.tableName === 'parents') ? 'profile_id' : 'id';
    const tempId = record[keyField as keyof T] || `rec-${Math.random().toString(36).substr(2, 9)}` as any;
    const prepared = {
      [keyField]: tempId,
      created_at: new Date().toISOString(),
      ...record
    };

    let newRecord: T;
    try {
      newRecord = await fetchApi(url, {
        method: 'POST',
        body: JSON.stringify(prepared),
      });
    } catch (err) {
      newRecord = prepared as any as T;
    }

    // Cache locally
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`astrix-db-${this.tableName}`);
      const cachedRecords = cached ? JSON.parse(cached) : [];
      
      const index = cachedRecords.findIndex((r: any) => r[keyField] === tempId);
      if (index !== -1) {
        cachedRecords[index] = newRecord;
      } else {
        cachedRecords.push(newRecord);
      }
      localStorage.setItem(`astrix-db-${this.tableName}`, JSON.stringify(cachedRecords));
    }

    return newRecord;
  }

  // Update a record by id or profile_id
  async update(id: string, updates: Partial<T>): Promise<T> {
    const keyField = (this.tableName === 'students' || this.tableName === 'faculty' || this.tableName === 'parents') 
      ? 'profile_id' 
      : 'id';
      
    const url = `/api/db/${this.tableName}?${keyField}=${encodeURIComponent(id)}`;
    
    let updatedRecord: T;
    try {
      updatedRecord = await fetchApi(url, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (err) {
      updatedRecord = {
        [keyField]: id,
        ...updates,
        updated_at: new Date().toISOString()
      } as any as T;
    }

    // Cache locally
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`astrix-db-${this.tableName}`);
      const cachedRecords = cached ? JSON.parse(cached) : [];
      const index = cachedRecords.findIndex((r: any) => r[keyField] === id);
      if (index !== -1) {
        cachedRecords[index] = { ...cachedRecords[index], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem(`astrix-db-${this.tableName}`, JSON.stringify(cachedRecords));
      } else {
        cachedRecords.push(updatedRecord);
        localStorage.setItem(`astrix-db-${this.tableName}`, JSON.stringify(cachedRecords));
      }
    }

    return updatedRecord;
  }

  // Delete a record
  async delete(id: string): Promise<{ success: boolean }> {
    const keyField = (this.tableName === 'students' || this.tableName === 'faculty' || this.tableName === 'parents') 
      ? 'profile_id' 
      : 'id';
      
    const url = `/api/db/${this.tableName}?${keyField}=${encodeURIComponent(id)}`;
    
    let success = false;
    try {
      const res = await fetchApi(url, {
        method: 'DELETE',
      });
      success = res.success;
    } catch (err) {
      success = true;
    }

    // Remove from local cache
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`astrix-db-${this.tableName}`);
      if (cached) {
        const cachedRecords = JSON.parse(cached);
        const filtered = cachedRecords.filter((r: any) => r[keyField] !== id);
        localStorage.setItem(`astrix-db-${this.tableName}`, JSON.stringify(filtered));
      }
    }

    return { success };
  }
}

export const db = {
  profiles: new TableClient('profiles'),
  departments: new TableClient('departments'),
  students: new TableClient('students'),
  faculty: new TableClient('faculty'),
  parents: new TableClient('parents'),
  courses: new TableClient('courses'),
  subjects: new TableClient('subjects'),
  student_subjects: new TableClient('student_subjects'),
  attendance: new TableClient('attendance'),
  attendance_logs: new TableClient('attendance_logs'),
  assignments: new TableClient('assignments'),
  submissions: new TableClient('submissions'),
  exams: new TableClient('exams'),
  exam_schedules: new TableClient('exam_schedules'),
  results: new TableClient('results'),
  fees: new TableClient('fees'),
  payments: new TableClient('payments'),
  certificates: new TableClient('certificates'),
  certificate_requests: new TableClient('certificate_requests'),
  leave_requests: new TableClient('leave_requests'),
  grievances: new TableClient('grievances'),
  events: new TableClient('events'),
  event_registrations: new TableClient('event_registrations'),
  notices: new TableClient('notices'),
  companies: new TableClient('companies'),
  placements: new TableClient('placements'),
  placement_applications: new TableClient('placement_applications'),
  interviews: new TableClient('interviews'),
  internships: new TableClient('internships'),
  internship_applications: new TableClient('internship_applications'),
  skills: new TableClient('skills'),
  student_skills: new TableClient('student_skills'),
  resume_uploads: new TableClient('resume_uploads'),
  achievements: new TableClient('achievements'),
  notes: new TableClient('notes'),
  messages: new TableClient('messages'),
  notifications: new TableClient('notifications'),
  ai_chat_history: new TableClient('ai_chat_history'),
  activity_logs: new TableClient('activity_logs'),
  audit_logs: new TableClient('audit_logs'),
  campus_locations: new TableClient('campus_locations'),
  system_settings: new TableClient('system_settings'),
  timetables: new TableClient('timetables'),
  timetable_entries: new TableClient('timetable_entries'),
};
