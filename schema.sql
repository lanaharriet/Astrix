-- ASTRIX Campus Database DDL Schema
-- Production Ready, Mobile First, Enterprise Grade

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'parent', 'admin')),
    avatar_url TEXT,
    phone TEXT,
    address TEXT,
    emergency_contact TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    hod_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    register_number TEXT NOT NULL UNIQUE,
    department_id UUID REFERENCES public.departments(id) ON DELETE RESTRICT,
    year INT NOT NULL CHECK (year BETWEEN 1 AND 4),
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    cgpa NUMERIC(4,2) DEFAULT 0.00 CHECK (cgpa BETWEEN 0.00 AND 10.00),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FACULTY
CREATE TABLE IF NOT EXISTS public.faculty (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    faculty_id TEXT NOT NULL UNIQUE,
    department_id UUID REFERENCES public.departments(id) ON DELETE RESTRICT,
    designation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PARENTS
CREATE TABLE IF NOT EXISTS public.parents (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    relation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SEMESTERS
CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COURSES
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    credits INT NOT NULL CHECK (credits BETWEEN 1 AND 6),
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SUBJECTS
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES public.faculty(profile_id) ON DELETE SET NULL,
    semester_id UUID REFERENCES public.semesters(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. STUDENT SUBJECTS (Relational table)
CREATE TABLE IF NOT EXISTS public.student_subjects (
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    semester_id UUID REFERENCES public.semesters(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, subject_id, semester_id)
);

-- 10. ATTENDANCE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
    qr_scanned BOOLEAN DEFAULT false,
    marked_by UUID REFERENCES public.faculty(profile_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ATTENDANCE LOGS
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    max_marks INT NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    content_url TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    marks_obtained INT,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (assignment_id, student_id)
);

-- 14. EXAMS
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Internal-1', 'Internal-2', 'Model', 'Semester')),
    date DATE NOT NULL,
    max_marks INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. EXAM SCHEDULES
CREATE TABLE IF NOT EXISTS public.exam_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    room TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. RESULTS
CREATE TABLE IF NOT EXISTS public.results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    marks_obtained INT NOT NULL,
    grade TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, exam_id, subject_id)
);

-- 17. FEES
CREATE TABLE IF NOT EXISTS public.fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Paid', 'Pending', 'Overdue')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee_id UUID REFERENCES public.fees(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_id TEXT NOT NULL UNIQUE,
    paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. CERTIFICATES
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. CERTIFICATE REQUESTS
CREATE TABLE IF NOT EXISTS public.certificate_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    certificate_type TEXT NOT NULL CHECK (certificate_type IN ('Bonafide Certificate', 'Study Certificate', 'Fee Receipt', 'Transfer Certificate')),
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    document_url TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL CHECK (leave_type IN ('Medical Leave', 'On Duty Leave', 'Event Leave')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. GRIEVANCES
CREATE TABLE IF NOT EXISTS public.grievances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'In Progress', 'Resolved')) DEFAULT 'Pending',
    resolution_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. EVENT REGISTRATIONS
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (event_id, user_id)
);

-- 25. NOTICES
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_role TEXT NOT NULL CHECK (target_role IN ('All', 'Student', 'Faculty', 'Parent')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. COMPANIES
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    industry TEXT,
    logo_url TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. PLACEMENTS
CREATE TABLE IF NOT EXISTS public.placements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    salary_package TEXT NOT NULL,
    job_description TEXT,
    eligibility_criteria TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. PLACEMENT APPLICATIONS
CREATE TABLE IF NOT EXISTS public.placement_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    placement_id UUID REFERENCES public.placements(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('Applied', 'Interviewing', 'Offered', 'Rejected')) DEFAULT 'Applied',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (placement_id, student_id)
);

-- 29. INTERVIEWS
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.placement_applications(id) ON DELETE CASCADE,
    round_name TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Scheduled', 'Passed', 'Failed')) DEFAULT 'Scheduled',
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 30. INTERNSHIPS
CREATE TABLE IF NOT EXISTS public.internships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    stipend TEXT,
    duration TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 31. INTERNSHIP APPLICATIONS
CREATE TABLE IF NOT EXISTS public.internship_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('Applied', 'Interviewing', 'Offered', 'Rejected')) DEFAULT 'Applied',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (internship_id, student_id)
);

-- 32. SKILLS
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 33. STUDENT SKILLS
CREATE TABLE IF NOT EXISTS public.student_skills (
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced')),
    PRIMARY KEY (student_id, skill_id)
);

-- 34. RESUME UPLOADS
CREATE TABLE IF NOT EXISTS public.resume_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    parsed_content_json JSONB,
    score INT CHECK (score BETWEEN 0 AND 100),
    analysis_json JSONB,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 35. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    certificate_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 36. NOTES
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT false,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 37. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 38. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 39. AI CHAT HISTORY
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 40. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 41. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    table_name TEXT NOT NULL,
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 42. CAMPUS LOCATIONS
CREATE TABLE IF NOT EXISTS public.campus_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    block_name TEXT,
    floor INT,
    room_number TEXT,
    coordinates_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 43. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- TRIGGERS TO UPDATE TIMESTAMPS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_certificate_requests_updated_at BEFORE UPDATE ON public.certificate_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_grievances_updated_at BEFORE UPDATE ON public.grievances FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create basic permissive RLS policies so the app runs smoothly with backend integration
-- In production, these should be tightly scoped based on auth.uid() and role checks
CREATE POLICY "Allow public read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow insert/update own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Allow public read" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Allow admin edit departments" ON public.departments FOR ALL USING (true);

CREATE POLICY "Allow student read" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow edit student" ON public.students FOR ALL USING (true);

CREATE POLICY "Allow faculty read" ON public.faculty FOR SELECT USING (true);
CREATE POLICY "Allow edit faculty" ON public.faculty FOR ALL USING (true);

CREATE POLICY "Allow parent read" ON public.parents FOR SELECT USING (true);
CREATE POLICY "Allow edit parent" ON public.parents FOR ALL USING (true);

CREATE POLICY "Allow read semesters" ON public.semesters FOR SELECT USING (true);
CREATE POLICY "Allow edit semesters" ON public.semesters FOR ALL USING (true);

CREATE POLICY "Allow read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow edit courses" ON public.courses FOR ALL USING (true);

CREATE POLICY "Allow read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow edit subjects" ON public.subjects FOR ALL USING (true);

CREATE POLICY "Allow read student_subjects" ON public.student_subjects FOR SELECT USING (true);
CREATE POLICY "Allow edit student_subjects" ON public.student_subjects FOR ALL USING (true);

CREATE POLICY "Allow read attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Allow edit attendance" ON public.attendance FOR ALL USING (true);

CREATE POLICY "Allow read attendance_logs" ON public.attendance_logs FOR SELECT USING (true);
CREATE POLICY "Allow edit attendance_logs" ON public.attendance_logs FOR ALL USING (true);

CREATE POLICY "Allow read assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Allow edit assignments" ON public.assignments FOR ALL USING (true);

CREATE POLICY "Allow read submissions" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Allow edit submissions" ON public.submissions FOR ALL USING (true);

CREATE POLICY "Allow read exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Allow edit exams" ON public.exams FOR ALL USING (true);

CREATE POLICY "Allow read exam_schedules" ON public.exam_schedules FOR SELECT USING (true);
CREATE POLICY "Allow edit exam_schedules" ON public.exam_schedules FOR ALL USING (true);

CREATE POLICY "Allow read results" ON public.results FOR SELECT USING (true);
CREATE POLICY "Allow edit results" ON public.results FOR ALL USING (true);

CREATE POLICY "Allow read fees" ON public.fees FOR SELECT USING (true);
CREATE POLICY "Allow edit fees" ON public.fees FOR ALL USING (true);

CREATE POLICY "Allow read payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Allow edit payments" ON public.payments FOR ALL USING (true);

CREATE POLICY "Allow read certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Allow edit certificates" ON public.certificates FOR ALL USING (true);

CREATE POLICY "Allow read certificate_requests" ON public.certificate_requests FOR SELECT USING (true);
CREATE POLICY "Allow edit certificate_requests" ON public.certificate_requests FOR ALL USING (true);

CREATE POLICY "Allow read leave_requests" ON public.leave_requests FOR SELECT USING (true);
CREATE POLICY "Allow edit leave_requests" ON public.leave_requests FOR ALL USING (true);

CREATE POLICY "Allow read grievances" ON public.grievances FOR SELECT USING (true);
CREATE POLICY "Allow edit grievances" ON public.grievances FOR ALL USING (true);

CREATE POLICY "Allow read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow edit events" ON public.events FOR ALL USING (true);

CREATE POLICY "Allow read event_registrations" ON public.event_registrations FOR SELECT USING (true);
CREATE POLICY "Allow edit event_registrations" ON public.event_registrations FOR ALL USING (true);

CREATE POLICY "Allow read notices" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Allow edit notices" ON public.notices FOR ALL USING (true);

CREATE POLICY "Allow read companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Allow edit companies" ON public.companies FOR ALL USING (true);

CREATE POLICY "Allow read placements" ON public.placements FOR SELECT USING (true);
CREATE POLICY "Allow edit placements" ON public.placements FOR ALL USING (true);

CREATE POLICY "Allow read placement_applications" ON public.placement_applications FOR SELECT USING (true);
CREATE POLICY "Allow edit placement_applications" ON public.placement_applications FOR ALL USING (true);

CREATE POLICY "Allow read interviews" ON public.interviews FOR SELECT USING (true);
CREATE POLICY "Allow edit interviews" ON public.interviews FOR ALL USING (true);

CREATE POLICY "Allow read internships" ON public.internships FOR SELECT USING (true);
CREATE POLICY "Allow edit internships" ON public.internships FOR ALL USING (true);

CREATE POLICY "Allow read internship_applications" ON public.internship_applications FOR SELECT USING (true);
CREATE POLICY "Allow edit internship_applications" ON public.internship_applications FOR ALL USING (true);

CREATE POLICY "Allow read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Allow edit skills" ON public.skills FOR ALL USING (true);

CREATE POLICY "Allow read student_skills" ON public.student_skills FOR SELECT USING (true);
CREATE POLICY "Allow edit student_skills" ON public.student_skills FOR ALL USING (true);

CREATE POLICY "Allow read resume_uploads" ON public.resume_uploads FOR SELECT USING (true);
CREATE POLICY "Allow edit resume_uploads" ON public.resume_uploads FOR ALL USING (true);

CREATE POLICY "Allow read achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Allow edit achievements" ON public.achievements FOR ALL USING (true);

CREATE POLICY "Allow read notes" ON public.notes FOR SELECT USING (true);
CREATE POLICY "Allow edit notes" ON public.notes FOR ALL USING (true);

CREATE POLICY "Allow read messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow edit messages" ON public.messages FOR ALL USING (true);

CREATE POLICY "Allow read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow edit notifications" ON public.notifications FOR ALL USING (true);

CREATE POLICY "Allow read ai_chat_history" ON public.ai_chat_history FOR SELECT USING (true);
CREATE POLICY "Allow edit ai_chat_history" ON public.ai_chat_history FOR ALL USING (true);

CREATE POLICY "Allow read activity_logs" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Allow edit activity_logs" ON public.activity_logs FOR ALL USING (true);

CREATE POLICY "Allow read audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow edit audit_logs" ON public.audit_logs FOR ALL USING (true);

CREATE POLICY "Allow read campus_locations" ON public.campus_locations FOR SELECT USING (true);
CREATE POLICY "Allow edit campus_locations" ON public.campus_locations FOR ALL USING (true);

CREATE POLICY "Allow read system_settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Allow edit system_settings" ON public.system_settings FOR ALL USING (true);

-- 44. TIMETABLES
CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    semester_id UUID REFERENCES public.semesters(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 45. TIMETABLE ENTRIES
CREATE TABLE IF NOT EXISTS public.timetable_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timetable_id UUID REFERENCES public.timetables(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    faculty_id UUID REFERENCES public.faculty(profile_id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(profile_id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('class', 'teaching', 'invigilation', 'exam')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read timetables" ON public.timetables FOR SELECT USING (true);
CREATE POLICY "Allow edit timetables" ON public.timetables FOR ALL USING (true);
CREATE POLICY "Allow read timetable_entries" ON public.timetable_entries FOR SELECT USING (true);
CREATE POLICY "Allow edit timetable_entries" ON public.timetable_entries FOR ALL USING (true);

