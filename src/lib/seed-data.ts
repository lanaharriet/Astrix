export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'parent' | 'admin';
  avatar_url?: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  hod_id?: string;
}

export interface Student {
  profile_id: string;
  register_number: string;
  department_id: string;
  year: number;
  semester: number;
  cgpa: number;
}

export interface Faculty {
  profile_id: string;
  faculty_id: string;
  department_id: string;
  designation: string;
}

export interface Parent {
  profile_id: string;
  student_id: string;
  relation: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  department_id: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  course_id: string;
  faculty_id: string;
  semester_id: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  subject_id: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
  qr_scanned: boolean;
  marked_by: string;
}

export interface Result {
  id: string;
  student_id: string;
  exam_id: string;
  subject_id: string;
  marks_obtained: number;
  grade: string;
}

export interface Fee {
  id: string;
  student_id: string;
  title: string;
  amount: number;
  due_date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface LeaveRequest {
  id: string;
  student_id: string;
  leave_type: 'Medical Leave' | 'On Duty Leave' | 'Event Leave';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approved_by?: string;
  requested_at: string;
}

export interface CertificateRequest {
  id: string;
  student_id: string;
  certificate_type: 'Bonafide Certificate' | 'Study Certificate' | 'Fee Receipt' | 'Transfer Certificate';
  status: 'Pending' | 'Approved' | 'Rejected';
  approved_by?: string;
  document_url?: string;
  requested_at: string;
}

export interface Grievance {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  resolution_details?: string;
  created_at: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  target_role: 'All' | 'Student' | 'Faculty' | 'Parent';
  created_by: string;
  created_at: string;
}

export interface Placement {
  id: string;
  company_name: string;
  industry: string;
  role: string;
  salary_package: string;
  eligibility_criteria: string;
  status: 'active' | 'closed';
  logo_url: string;
}

export interface PlacementApplication {
  id: string;
  placement_id: string;
  student_id: string;
  status: 'Applied' | 'Interviewing' | 'Offered' | 'Rejected';
  applied_at: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  block_name: string;
  floor: number;
  room_number: string;
  x: number; // For SVG mapping
  y: number; // For SVG mapping
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  subject_id: string;
  is_public: boolean;
  file_url?: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  subject_id: string;
  title: string;
  description: string;
  due_date: string;
  max_marks: number;
  created_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content_url: string;
  submitted_at: string;
  marks_obtained?: number;
  feedback?: string;
}

export const SEED_DEPARTMENTS: Department[] = [
  { id: 'd-cse', name: 'Computer Science and Engineering', code: 'CSE', description: 'Department of Computer Science & Engineering' },
  { id: 'd-aiml', name: 'Artificial Intelligence and Machine Learning', code: 'AIML', description: 'Department of AI & Machine Learning' },
  { id: 'd-csbs', name: 'Computer Science and Business Systems', code: 'CSBS', description: 'Department of CS & Business Systems' },
  { id: 'd-aids', name: 'Artificial Intelligence and Data Science', code: 'AIDS', description: 'Department of AI & Data Science' },
  { id: 'd-ece', name: 'Electronics and Communication Engineering', code: 'ECE', description: 'Department of Electronics & Communication Engineering' },
  { id: 'd-eee', name: 'Electrical and Electronics Engineering', code: 'EEE', description: 'Department of Electrical & Electronics Engineering' },
  { id: 'd-mech', name: 'Mechanical Engineering', code: 'MECH', description: 'Department of Mechanical Engineering' },
  { id: 'd-civil', name: 'Civil Engineering', code: 'CIVIL', description: 'Department of Civil Engineering' },
  { id: 'd-bme', name: 'Biomedical Engineering', code: 'BME', description: 'Department of Biomedical Engineering' },
  { id: 'd-mba', name: 'Master of Business Administration', code: 'MBA', description: 'Department of Management Studies' },
];

export const SEED_PROFILES: Profile[] = [
  // Admins
  { id: 'u-admin-1', name: 'Dr. Sarah Jenkins', email: 'admin@astrix.edu', role: 'admin', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120', phone: '+1 (555) 010-0001', address: '100 University Drive, Campus Center, Suite 401', emergency_contact: 'Jane Jenkins: +1 (555) 010-0002' },
  // Faculty
  { id: 'u-faculty-cse-hod', name: 'Dr. Alan Turing', email: 'turing@astrix.edu', role: 'faculty', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120', phone: '+1 (555) 010-0010', address: 'Block A, Faculty Cabins, Room A-301', emergency_contact: 'Mary Turing: +1 (555) 010-0011' },
  { id: 'u-faculty-aiml', name: 'Prof. Grace Hopper', email: 'hopper@astrix.edu', role: 'faculty', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120', phone: '+1 (555) 010-0020', address: 'Block B, Faculty Cabins, Room B-205', emergency_contact: 'John Hopper: +1 (555) 010-0021' },
  { id: 'u-faculty-ece', name: 'Dr. Nikola Tesla', email: 'tesla@astrix.edu', role: 'faculty', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120', phone: '+1 (555) 010-0030', address: 'Block E, Faculty Cabins, Room E-112', emergency_contact: 'Luka Tesla: +1 (555) 010-0031' },
  // Students
  { id: 'u-student-1', name: 'John Doe', email: 'john.doe@astrix.edu', role: 'student', avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120', phone: '+1 (555) 010-0101', address: 'Boys Hostel, Block C, Room 304', emergency_contact: 'Richard Doe (Father): +1 (555) 010-0102' },
  { id: 'u-student-2', name: 'Jane Smith', email: 'jane.smith@astrix.edu', role: 'student', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120', phone: '+1 (555) 010-0201', address: 'Girls Hostel, Block B, Room 102', emergency_contact: 'Helen Smith (Mother): +1 (555) 010-0202' },
  { id: 'u-student-3', name: 'Alex Rivera', email: 'alex.rivera@astrix.edu', role: 'student', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120', phone: '+1 (555) 010-0301', address: '452 Maple Street, Apt 3B, Metro City', emergency_contact: 'Carlos Rivera (Brother): +1 (555) 010-0302' },
  // Parents
  { id: 'u-parent-1', name: 'Richard Doe', email: 'richard.doe@gmail.com', role: 'parent', avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120', phone: '+1 (555) 010-0102', address: '128 Pine Ridge Dr, Metro City', emergency_contact: 'John Doe: +1 (555) 010-0101' },
];

export const SEED_STUDENTS: Student[] = [
  { profile_id: 'u-student-1', register_number: '2023CSE1024', department_id: 'd-cse', year: 3, semester: 5, cgpa: 8.74 },
  { profile_id: 'u-student-2', register_number: '2024AIML2056', department_id: 'd-aiml', year: 2, semester: 3, cgpa: 9.12 },
  { profile_id: 'u-student-3', register_number: '2023CSE1088', department_id: 'd-cse', year: 3, semester: 5, cgpa: 7.92 },
];

export const SEED_FACULTY: Faculty[] = [
  { profile_id: 'u-faculty-cse-hod', faculty_id: 'FAC-CSE-001', department_id: 'd-cse', designation: 'Professor & HOD' },
  { profile_id: 'u-faculty-aiml', faculty_id: 'FAC-AIML-003', department_id: 'd-aiml', designation: 'Associate Professor' },
  { profile_id: 'u-faculty-ece', faculty_id: 'FAC-ECE-012', department_id: 'd-ece', designation: 'Professor' },
];

export const SEED_PARENTS: Parent[] = [
  { profile_id: 'u-parent-1', student_id: 'u-student-1', relation: 'Father' },
];

export const SEED_COURSES: Course[] = [
  { id: 'c-cse-core', code: 'CS301', name: 'B.E. Computer Science and Engineering', credits: 4, department_id: 'd-cse' },
  { id: 'c-aiml-core', code: 'AI201', name: 'B.Tech Artificial Intelligence & Machine Learning', credits: 4, department_id: 'd-aiml' },
];

export const SEED_SUBJECTS: Subject[] = [
  { id: 's-dbms', name: 'Database Management Systems', code: 'CS301-DBMS', course_id: 'c-cse-core', faculty_id: 'u-faculty-cse-hod', semester_id: 'sem-active' },
  { id: 's-os', name: 'Operating Systems', code: 'CS302-OS', course_id: 'c-cse-core', faculty_id: 'u-faculty-cse-hod', semester_id: 'sem-active' },
  { id: 's-ml', name: 'Machine Learning Foundations', code: 'AI201-ML', course_id: 'c-aiml-core', faculty_id: 'u-faculty-aiml', semester_id: 'sem-active' },
  { id: 's-dsp', name: 'Digital Signal Processing', code: 'EC402-DSP', course_id: 'c-cse-core', faculty_id: 'u-faculty-ece', semester_id: 'sem-active' },
];

export const SEED_ATTENDANCE: Attendance[] = [
  { id: 'att-1', student_id: 'u-student-1', subject_id: 's-dbms', date: '2026-06-08', status: 'Present', qr_scanned: true, marked_by: 'u-faculty-cse-hod' },
  { id: 'att-2', student_id: 'u-student-1', subject_id: 's-os', date: '2026-06-08', status: 'Present', qr_scanned: false, marked_by: 'u-faculty-cse-hod' },
  { id: 'att-3', student_id: 'u-student-2', subject_id: 's-ml', date: '2026-06-08', status: 'Present', qr_scanned: true, marked_by: 'u-faculty-aiml' },
  { id: 'att-4', student_id: 'u-student-3', subject_id: 's-dbms', date: '2026-06-08', status: 'Absent', qr_scanned: false, marked_by: 'u-faculty-cse-hod' },
  { id: 'att-5', student_id: 'u-student-1', subject_id: 's-dbms', date: '2026-06-07', status: 'Present', qr_scanned: true, marked_by: 'u-faculty-cse-hod' },
  { id: 'att-6', student_id: 'u-student-1', subject_id: 's-os', date: '2026-06-07', status: 'Present', qr_scanned: false, marked_by: 'u-faculty-cse-hod' },
  { id: 'att-7', student_id: 'u-student-3', subject_id: 's-dbms', date: '2026-06-07', status: 'Late', qr_scanned: false, marked_by: 'u-faculty-cse-hod' },
];

export const SEED_EXAMS = [
  { id: 'exam-int-1', name: 'Internal Assessment 1', type: 'Internal-1', date: '2026-04-15', max_marks: 50 },
  { id: 'exam-int-2', name: 'Internal Assessment 2', type: 'Internal-2', date: '2026-05-20', max_marks: 50 },
];

export const SEED_RESULTS: Result[] = [
  { id: 'res-1', student_id: 'u-student-1', exam_id: 'exam-int-1', subject_id: 's-dbms', marks_obtained: 44, grade: 'A+' },
  { id: 'res-2', student_id: 'u-student-1', exam_id: 'exam-int-1', subject_id: 's-os', marks_obtained: 38, grade: 'B+' },
  { id: 'res-3', student_id: 'u-student-2', exam_id: 'exam-int-1', subject_id: 's-ml', marks_obtained: 48, grade: 'O' },
  { id: 'res-4', student_id: 'u-student-3', exam_id: 'exam-int-1', subject_id: 's-dbms', marks_obtained: 32, grade: 'B' },
];

export const SEED_FEES: Fee[] = [
  { id: 'fee-tuition-1', student_id: 'u-student-1', title: 'Tuition Fee - Semester 5', amount: 85000.00, due_date: '2026-07-01', status: 'Pending' },
  { id: 'fee-hostel-1', student_id: 'u-student-1', title: 'Hostel Rent - Annual', amount: 45000.00, due_date: '2026-05-15', status: 'Paid' },
  { id: 'fee-exam-1', student_id: 'u-student-1', title: 'Semester Exam Registration', amount: 3200.00, due_date: '2026-06-15', status: 'Pending' },
  { id: 'fee-tuition-2', student_id: 'u-student-2', title: 'Tuition Fee - Semester 3', amount: 90000.00, due_date: '2026-07-01', status: 'Pending' },
];

export const SEED_PAYMENTS = [
  { id: 'pay-1', fee_id: 'fee-hostel-1', amount: 45000.00, payment_method: 'Net Banking', transaction_id: 'TXN8492019482', paid_at: '2026-05-10T11:24:00Z' },
];

export const SEED_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'leave-1', student_id: 'u-student-1', leave_type: 'Medical Leave', start_date: '2026-06-10', end_date: '2026-06-12', reason: 'Viral fever, advised bed rest by physician.', status: 'Pending', requested_at: '2026-06-08T09:15:00Z' },
  { id: 'leave-2', student_id: 'u-student-2', leave_type: 'Event Leave', start_date: '2026-05-12', end_date: '2026-05-14', reason: 'Representing college in National Level Hackathon.', status: 'Approved', approved_by: 'u-faculty-aiml', requested_at: '2026-05-09T14:30:00Z' },
];

export const SEED_CERTIFICATE_REQUESTS: CertificateRequest[] = [
  { id: 'cert-req-1', student_id: 'u-student-1', certificate_type: 'Bonafide Certificate', status: 'Pending', requested_at: '2026-06-08T10:45:00Z' },
  { id: 'cert-req-2', student_id: 'u-student-2', certificate_type: 'Study Certificate', status: 'Approved', approved_by: 'u-admin-1', document_url: '/documents/study_cert_jane.pdf', requested_at: '2026-05-20T11:00:00Z' },
];

export const SEED_GRIEVANCES: Grievance[] = [
  { id: 'griev-1', user_id: 'u-student-1', title: 'Slow Wi-Fi in Hostel Block C', description: 'The internet connection speed in Hostel Block C, 3rd floor is extremely slow, making it impossible to complete assignments.', category: 'Infrastructure', status: 'In Progress', created_at: '2026-06-05T16:20:00Z' },
  { id: 'griev-2', user_id: 'u-student-2', title: 'Incorrect entry in DBMS assignment', description: 'Assignment marks entered in the portal are 8/10, but the graded physical script shows 9/10.', category: 'Academic', status: 'Resolved', resolution_details: 'Correction updated in the internal marksheet database.', created_at: '2026-05-18T10:15:00Z' },
];

export const SEED_NOTICES: Notice[] = [
  { id: 'not-1', title: 'Upcoming Semester Exam Registrations', content: 'Registrations for upcoming Semester Examinations close on 15th June 2026. A late fee of ₹1,000 will apply thereafter. Ensure all outstanding fees are paid before registering.', target_role: 'All', created_by: 'u-admin-1', created_at: '2026-06-01T09:00:00Z' },
  { id: 'not-2', title: 'Placement Drive: Google APAC 2026', content: 'Google is hosting a virtual placement and internship drive for CSE/AIML students of the 2027 batch. Register in the placement portal. CTC: 32 LPA. Deadline: 20th June.', target_role: 'Student', created_by: 'u-admin-1', created_at: '2026-06-07T14:00:00Z' },
  { id: 'not-3', title: 'Faculty Meeting: Syllabus Review', content: 'All department heads and faculty members are requested to attend the syllabus review meeting on Wednesday at 2:00 PM in the Administration Block Auditorium.', target_role: 'Faculty', created_by: 'u-admin-1', created_at: '2026-06-06T11:00:00Z' },
];

export const SEED_PLACEMENTS: Placement[] = [
  { id: 'pl-1', company_name: 'Google', industry: 'Software / Technology', role: 'Software Engineer (L3)', salary_package: '32 LPA', eligibility_criteria: 'CSE/AIML/AIDS, Year 3/4, CGPA >= 8.5, No Active Backlogs', status: 'active', logo_url: 'https://img.icons8.com/color/120/google-logo.png' },
  { id: 'pl-2', company_name: 'Microsoft', industry: 'Software / Cloud', role: 'Program Manager', salary_package: '28 LPA', eligibility_criteria: 'Open to All Branches, CGPA >= 8.0', status: 'active', logo_url: 'https://img.icons8.com/color/120/microsoft.png' },
  { id: 'pl-3', company_name: 'NVIDIA', industry: 'Hardware / AI', role: 'Silicon Architecture Intern', salary_package: '15 LPA (Stipend: 60k/mo)', eligibility_criteria: 'ECE/EEE/CSE, Year 3, CGPA >= 8.75', status: 'active', logo_url: 'https://img.icons8.com/color/120/nvidia.png' },
];

export const SEED_PLACEMENT_APPLICATIONS: PlacementApplication[] = [
  { id: 'pl-app-1', placement_id: 'pl-1', student_id: 'u-student-1', status: 'Interviewing', applied_at: '2026-06-07T18:00:00Z' },
  { id: 'pl-app-2', placement_id: 'pl-1', student_id: 'u-student-2', status: 'Applied', applied_at: '2026-06-07T18:30:00Z' },
];

export const SEED_INTERVIEWS = [
  { id: 'intv-1', application_id: 'pl-app-1', round_name: 'Technical Round 1: DSA', date: '2026-06-12T10:00:00Z', status: 'Scheduled', feedback: '' },
];

export const SEED_CAMPUS_LOCATIONS: CampusLocation[] = [
  { id: 'loc-gate', name: 'Main Gate', block_name: 'Entrance', floor: 0, room_number: 'Gate-1', x: 100, y: 450 },
  { id: 'loc-admin', name: 'Administration Block', block_name: 'Admin Block', floor: 1, room_number: 'Admin-101', x: 250, y: 380 },
  { id: 'loc-cse', name: 'CSE Block', block_name: 'Block A', floor: 3, room_number: 'A-301', x: 400, y: 200 },
  { id: 'loc-aiml', name: 'AIML Block', block_name: 'Block B', floor: 2, room_number: 'B-205', x: 400, y: 300 },
  { id: 'loc-csbs', name: 'CSBS Block', block_name: 'Block C', floor: 2, room_number: 'C-201', x: 400, y: 400 },
  { id: 'loc-aids', name: 'AIDS Block', block_name: 'Block D', floor: 1, room_number: 'D-102', x: 400, y: 500 },
  { id: 'loc-ece', name: 'ECE Block', block_name: 'Block E', floor: 2, room_number: 'E-112', x: 550, y: 200 },
  { id: 'loc-eee', name: 'EEE Block', block_name: 'Block F', floor: 1, room_number: 'F-101', x: 550, y: 300 },
  { id: 'loc-mech', name: 'MECH Block', block_name: 'Block G', floor: 1, room_number: 'G-104', x: 550, y: 400 },
  { id: 'loc-civil', name: 'CIVIL Block', block_name: 'Block H', floor: 1, room_number: 'H-101', x: 550, y: 500 },
  { id: 'loc-bme', name: 'BME Block', block_name: 'Block I', floor: 1, room_number: 'I-102', x: 680, y: 250 },
  { id: 'loc-mba', name: 'MBA Block', block_name: 'Management Block', floor: 2, room_number: 'MBA-201', x: 680, y: 350 },
  { id: 'loc-library', name: 'Central Library', block_name: 'Library Block', floor: 2, room_number: 'Library-Main', x: 250, y: 220 },
  { id: 'loc-auditorium', name: 'Auditorium', block_name: 'Academic Plaza', floor: 0, room_number: 'Aud-Main', x: 180, y: 150 },
  { id: 'loc-canteen', name: 'Canteen', block_name: 'Food Court', floor: 0, room_number: 'Canteen-Main', x: 280, y: 550 },
  { id: 'loc-hostel-boys', name: 'Boys Hostel', block_name: 'Block C Hostel', floor: 4, room_number: 'BH-304', x: 800, y: 150 },
  { id: 'loc-hostel-girls', name: 'Girls Hostel', block_name: 'Block B Hostel', floor: 4, room_number: 'GH-102', x: 800, y: 300 },
  { id: 'loc-placement', name: 'Placement Cell', block_name: 'Admin Block Annex', floor: 0, room_number: 'PC-12', x: 250, y: 420 },
  { id: 'loc-sports', name: 'Sports Complex', block_name: 'Arena', floor: 0, room_number: 'Arena-1', x: 750, y: 480 },
  { id: 'loc-medical', name: 'Medical Center', block_name: 'Health Block', floor: 0, room_number: 'Health-1', x: 180, y: 480 },
  { id: 'loc-parking', name: 'Parking Area', block_name: 'North Lot', floor: 0, room_number: 'Parking-1', x: 100, y: 200 }
];

export const SEED_ASSIGNMENTS: Assignment[] = [
  { id: 'asg-dbms-1', subject_id: 's-dbms', title: 'Assignment 1: SQL Queries and Schema Design', description: 'Design schema DDL and write complex SQL queries using JOINs and Aggregates.', due_date: '2026-06-15T23:59:59Z', max_marks: 100, created_at: '2026-06-05T09:00:00Z' },
  { id: 'asg-os-1', subject_id: 's-os', title: 'Assignment 1: CPU Scheduling Simulator', description: 'Implement CPU scheduling algorithms like FCFS, SJF, and Round Robin in C/C++.', due_date: '2026-06-20T23:59:59Z', max_marks: 100, created_at: '2026-06-06T10:00:00Z' },
  { id: 'asg-ml-1', subject_id: 's-ml', title: 'Assignment 1: Linear Regression implementation', description: 'Implement linear regression from scratch using numpy and plot loss curve.', due_date: '2026-06-18T23:59:59Z', max_marks: 100, created_at: '2026-06-07T11:00:00Z' }
];

export const SEED_SUBMISSIONS: Submission[] = [
  { id: 'sub-dbms-1', assignment_id: 'asg-dbms-1', student_id: 'u-student-1', content_url: '/uploads/submissions/john_dbms1.pdf', submitted_at: '2026-06-10T14:30:00Z', marks_obtained: 92, feedback: 'Excellent schema design. Good query optimizations.' },
];

export const SEED_NOTES: Note[] = [
  { id: 'note-dbms-1', user_id: 'u-faculty-cse-hod', title: 'DBMS Lecture Notes - Normalization', content: 'Detailing 1NF, 2NF, 3NF, BCNF, and multi-valued dependencies.', subject_id: 's-dbms', is_public: true, file_url: '/documents/notes/dbms_normalization.pdf', created_at: '2026-05-15T09:00:00Z' },
  { id: 'note-os-1', user_id: 'u-faculty-cse-hod', title: 'OS - Deadlocks and Semaphores', content: 'Detailed discussion on Bankers algorithm and dining philosophers problem.', subject_id: 's-os', is_public: true, file_url: '/documents/notes/os_deadlocks.pdf', created_at: '2026-05-20T10:00:00Z' },
];

export const SEED_SYSTEM_SETTINGS = [
  { key: 'academic_year', value: '2025-2026' },
  { key: 'semester_type', value: 'Odd Semester' },
  { key: 'copilot_enabled', value: 'true' },
];

export interface Timetable {
  id: string;
  name: string;
  semester_id: string;
  is_active: boolean;
}

export interface TimetableEntry {
  id: string;
  timetable_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject_id: string;
  room_number: string;
  faculty_id?: string;
  student_id?: string;
  type: 'class' | 'teaching' | 'invigilation' | 'exam';
}

export const SEED_TIMETABLES: Timetable[] = [
  { id: 'tt-active', name: 'Main Fall 2026 Timetable', semester_id: 'sem-active', is_active: true }
];

export const SEED_TIMETABLE_ENTRIES: TimetableEntry[] = [
  // Student John Doe Monday classes
  { id: 'tte-1', timetable_id: 'tt-active', day_of_week: 1, start_time: '09:00', end_time: '10:30', subject_id: 's-dbms', room_number: 'A-301', faculty_id: 'u-faculty-cse-hod', student_id: 'u-student-1', type: 'class' },
  { id: 'tte-2', timetable_id: 'tt-active', day_of_week: 1, start_time: '10:45', end_time: '12:15', subject_id: 's-os', room_number: 'A-302', faculty_id: 'u-faculty-cse-hod', student_id: 'u-student-1', type: 'class' },
  { id: 'tte-3', timetable_id: 'tt-active', day_of_week: 1, start_time: '13:30', end_time: '15:00', subject_id: 's-dsp', room_number: 'E-112', faculty_id: 'u-faculty-ece', student_id: 'u-student-1', type: 'class' },
  
  // Student John Doe Tuesday classes
  { id: 'tte-4', timetable_id: 'tt-active', day_of_week: 2, start_time: '09:00', end_time: '10:30', subject_id: 's-os', room_number: 'A-302', faculty_id: 'u-faculty-cse-hod', student_id: 'u-student-1', type: 'class' },
  { id: 'tte-5', timetable_id: 'tt-active', day_of_week: 2, start_time: '10:45', end_time: '12:15', subject_id: 's-dbms', room_number: 'A-301', faculty_id: 'u-faculty-cse-hod', student_id: 'u-student-1', type: 'class' },

  // Student John Doe Wednesday class
  { id: 'tte-6', timetable_id: 'tt-active', day_of_week: 3, start_time: '13:30', end_time: '15:00', subject_id: 's-ml', room_number: 'B-205', faculty_id: 'u-faculty-aiml', student_id: 'u-student-1', type: 'class' },

  // Student Jane Smith Monday class
  { id: 'tte-7', timetable_id: 'tt-active', day_of_week: 1, start_time: '09:00', end_time: '10:30', subject_id: 's-ml', room_number: 'B-205', faculty_id: 'u-faculty-aiml', student_id: 'u-student-2', type: 'class' },

  // Faculty Alan Turing Monday teaching
  { id: 'tte-8', timetable_id: 'tt-active', day_of_week: 1, start_time: '09:00', end_time: '10:30', subject_id: 's-dbms', room_number: 'A-301', faculty_id: 'u-faculty-cse-hod', type: 'teaching' },
  { id: 'tte-9', timetable_id: 'tt-active', day_of_week: 1, start_time: '10:45', end_time: '12:15', subject_id: 's-os', room_number: 'A-302', faculty_id: 'u-faculty-cse-hod', type: 'teaching' },

  // Faculty Alan Turing Tuesday teaching
  { id: 'tte-10', timetable_id: 'tt-active', day_of_week: 2, start_time: '09:00', end_time: '10:30', subject_id: 's-os', room_number: 'A-302', faculty_id: 'u-faculty-cse-hod', type: 'teaching' },
  { id: 'tte-11', timetable_id: 'tt-active', day_of_week: 2, start_time: '10:45', end_time: '12:15', subject_id: 's-dbms', room_number: 'A-301', faculty_id: 'u-faculty-cse-hod', type: 'teaching' },

  // Faculty Alan Turing Invigilations
  { id: 'tte-12', timetable_id: 'tt-active', day_of_week: 1, start_time: '09:30', end_time: '12:30', subject_id: 's-dbms', room_number: 'A-301', faculty_id: 'u-faculty-cse-hod', type: 'invigilation' }
];

