import mongoose, { Schema } from 'mongoose';

// Base options for all schemas
const baseSchemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  _id: false // Disable auto ObjectId _id generation by default since we supply string _id
};

// 1. User / Profile Model
const UserSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['student', 'faculty', 'parent', 'admin'] },
  department: { type: String },
  phone: { type: String },
  avatar: { type: String },
  isActive: { type: Boolean, default: true }
}, baseSchemaOptions);

UserSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });
UserSchema.virtual('name').get(function() { return this.fullName; }).set(function(v) { this.fullName = v; });
UserSchema.virtual('full_name').get(function() { return this.fullName; }).set(function(v) { this.fullName = v; });
UserSchema.virtual('avatar_url').get(function() { return this.avatar; }).set(function(v) { this.avatar = v; });

// 2. Department Model
const DepartmentSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  hod_id: { type: String }
}, baseSchemaOptions);
DepartmentSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 3. Student Model
const StudentSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  profile_id: { type: String, required: true, unique: true },
  register_number: { type: String, required: true, unique: true },
  department_id: { type: String, required: true },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
  cgpa: { type: Number, default: 0.00 }
}, baseSchemaOptions);
StudentSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 4. Faculty Model
const FacultySchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  profile_id: { type: String, required: true, unique: true },
  faculty_id: { type: String, required: true, unique: true },
  department_id: { type: String, required: true },
  designation: { type: String, required: true }
}, baseSchemaOptions);
FacultySchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 5. Parent Model
const ParentSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  profile_id: { type: String, required: true, unique: true },
  student_id: { type: String, required: true },
  relation: { type: String, required: true }
}, baseSchemaOptions);
ParentSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 6. Course Model
const CourseSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  code: { type: String, required: true },
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  department_id: { type: String, required: true }
}, baseSchemaOptions);
CourseSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 7. Subject Model
const SubjectSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  code: { type: String, required: true },
  course_id: { type: String, required: true },
  faculty_id: { type: String, required: true },
  semester_id: { type: String, required: true }
}, baseSchemaOptions);
SubjectSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 8. Attendance Model
const AttendanceSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  student_id: { type: String, required: true },
  subject_id: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, required: true, enum: ['Present', 'Absent', 'Late'] },
  qr_scanned: { type: Boolean, default: false },
  marked_by: { type: String }
}, baseSchemaOptions);
AttendanceSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 9. Exam Model
const ExamSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  type: { type: String, required: true },
  date: { type: String, required: true },
  max_marks: { type: Number, required: true }
}, baseSchemaOptions);
ExamSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 10. Result Model
const ResultSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  student_id: { type: String, required: true },
  exam_id: { type: String, required: true },
  subject_id: { type: String, required: true },
  marks_obtained: { type: Number, required: true },
  grade: { type: String, required: true }
}, baseSchemaOptions);
ResultSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 11. Fee Model
const FeeSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  student_id: { type: String, required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  due_date: { type: String, required: true },
  status: { type: String, required: true, enum: ['Paid', 'Pending', 'Overdue'] }
}, baseSchemaOptions);
FeeSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 12. Payment Model
const PaymentSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  fee_id: { type: String, required: true },
  amount: { type: Number, required: true },
  payment_method: { type: String, required: true },
  transaction_id: { type: String, required: true },
  paid_at: { type: String, required: true }
}, baseSchemaOptions);
PaymentSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 13. LeaveRequest Model
const LeaveRequestSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  student_id: { type: String, required: true },
  leave_type: { type: String, required: true },
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, required: true, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approved_by: { type: String },
  requested_at: { type: String, required: true }
}, baseSchemaOptions);
LeaveRequestSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 14. CertificateRequest Model
const CertificateRequestSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  student_id: { type: String, required: true },
  certificate_type: { type: String, required: true },
  status: { type: String, required: true, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approved_by: { type: String },
  document_url: { type: String },
  requested_at: { type: String, required: true }
}, baseSchemaOptions);
CertificateRequestSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 15. Grievance Model
const GrievanceSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  user_id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, required: true, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  resolution_details: { type: String },
  created_at: { type: String, required: true }
}, baseSchemaOptions);
GrievanceSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 16. Notice Model
const NoticeSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  title: { type: String, required: true },
  content: { type: String, required: true },
  target_role: { type: String, required: true, enum: ['All', 'Student', 'Faculty', 'Parent'] },
  created_by: { type: String, required: true },
  created_at: { type: String, required: true }
}, baseSchemaOptions);
NoticeSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 17. Placement Model
const PlacementSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  company_name: { type: String, required: true },
  industry: { type: String, required: true },
  role: { type: String, required: true },
  salary_package: { type: String, required: true },
  eligibility_criteria: { type: String, required: true },
  status: { type: String, required: true, enum: ['active', 'closed'], default: 'active' },
  logo_url: { type: String }
}, baseSchemaOptions);
PlacementSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 18. PlacementApplication Model
const PlacementApplicationSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  placement_id: { type: String, required: true },
  student_id: { type: String, required: true },
  status: { type: String, required: true, enum: ['Applied', 'Interviewing', 'Offered', 'Rejected'], default: 'Applied' },
  applied_at: { type: String, required: true }
}, baseSchemaOptions);
PlacementApplicationSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 19. Interview Model
const InterviewSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  application_id: { type: String, required: true },
  round_name: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, required: true, default: 'Scheduled' },
  feedback: { type: String }
}, baseSchemaOptions);
InterviewSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 20. CampusLocation Model
const CampusLocationSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  block_name: { type: String, required: true },
  floor: { type: Number, required: true },
  room_number: { type: String, required: true },
  x: { type: Number },
  y: { type: Number },
  coordinates_json: { type: Schema.Types.Mixed }
}, baseSchemaOptions);
CampusLocationSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 21. Assignment Model
const AssignmentSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  subject_id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  due_date: { type: String, required: true },
  max_marks: { type: Number, required: true }
}, baseSchemaOptions);
AssignmentSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 22. Submission Model
const SubmissionSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  assignment_id: { type: String, required: true },
  student_id: { type: String, required: true },
  content_url: { type: String, required: true },
  submitted_at: { type: String, required: true },
  marks_obtained: { type: Number },
  feedback: { type: String }
}, baseSchemaOptions);
SubmissionSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 23. Note Model
const NoteSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  user_id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  subject_id: { type: String, required: true },
  is_public: { type: Boolean, default: true },
  file_url: { type: String },
  created_at: { type: String, required: true }
}, baseSchemaOptions);
NoteSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 24. SystemSetting Model
const SystemSettingSchema = new Schema({
  _id: { type: String }, // key acts as _id
  key: { type: String },
  value: { type: String, required: true }
}, baseSchemaOptions);
SystemSettingSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 25. Timetable Model
const TimetableSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  semester_id: { type: String, required: true },
  is_active: { type: Boolean, default: false }
}, baseSchemaOptions);
TimetableSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 26. TimetableEntry Model
const TimetableEntrySchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  timetable_id: { type: String, required: true },
  day_of_week: { type: Number, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  subject_id: { type: String, required: true },
  room_number: { type: String, required: true },
  faculty_id: { type: String },
  student_id: { type: String },
  type: { type: String, required: true, enum: ['class', 'teaching', 'invigilation', 'exam'] }
}, baseSchemaOptions);
TimetableEntrySchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 27. Message Model
const MessageSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  sender_id: { type: String, required: true },
  recipient_id: { type: String, required: true },
  content: { type: String, required: true },
  created_at: { type: String, required: true }
}, baseSchemaOptions);
MessageSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 28. Notification Model
const NotificationSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  user_id: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String },
  is_read: { type: Boolean, default: false }
}, baseSchemaOptions);
NotificationSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 29. AIChatHistory Model
const AIChatHistorySchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  user_id: { type: String, required: true },
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  created_at: { type: String, required: true }
}, baseSchemaOptions);
AIChatHistorySchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 30. ActivityLog Model
const ActivityLogSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  user_id: { type: String, required: true },
  activity: { type: String, required: true },
  details: { type: String },
  created_at: { type: String, required: true }
}, baseSchemaOptions);
ActivityLogSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 31. AuditLog Model
const AuditLogSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  user_id: { type: String, required: true },
  table_name: { type: String, required: true },
  action: { type: String, required: true },
  old_data: { type: Schema.Types.Mixed },
  new_data: { type: Schema.Types.Mixed }
}, baseSchemaOptions);
AuditLogSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 32. Skill Model
const SkillSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  category: { type: String, required: true }
}, baseSchemaOptions);
SkillSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 33. StudentSkill Model
const StudentSkillSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  student_id: { type: String, required: true },
  skill_id: { type: String, required: true },
  proficiency_level: { type: String, required: true }
}, baseSchemaOptions);
StudentSkillSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 34. ResumeUpload Model
const ResumeUploadSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  student_id: { type: String, required: true },
  file_name: { type: String, required: true },
  file_url: { type: String, required: true },
  parsed_data: { type: Schema.Types.Mixed },
  created_at: { type: String, required: true }
}, baseSchemaOptions);
ResumeUploadSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 35. Achievement Model
const AchievementSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  student_id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String },
  category: { type: String }
}, baseSchemaOptions);
AchievementSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// 36. Semester Model (used for timetable relations)
const SemesterSchema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  start_date: { type: String },
  end_date: { type: String },
  is_active: { type: Boolean, default: false }
}, baseSchemaOptions);
SemesterSchema.virtual('id').get(function() { return this._id; }).set(function(v) { this._id = v; });

// Register models if not already registered
export const User = mongoose.models.User || mongoose.model('User', UserSchema, 'profiles');
export const Department = mongoose.models.Department || mongoose.model('Department', DepartmentSchema, 'departments');
export const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema, 'students');
export const Faculty = mongoose.models.Faculty || mongoose.model('Faculty', FacultySchema, 'faculty');
export const Parent = mongoose.models.Parent || mongoose.model('Parent', ParentSchema, 'parents');
export const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema, 'courses');
export const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema, 'subjects');
export const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema, 'attendance');
export const Exam = mongoose.models.Exam || mongoose.model('Exam', ExamSchema, 'exams');
export const Result = mongoose.models.Result || mongoose.model('Result', ResultSchema, 'results');
export const Fee = mongoose.models.Fee || mongoose.model('Fee', FeeSchema, 'fees');
export const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema, 'payments');
export const LeaveRequest = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', LeaveRequestSchema, 'leave_requests');
export const CertificateRequest = mongoose.models.CertificateRequest || mongoose.model('CertificateRequest', CertificateRequestSchema, 'certificate_requests');
export const Grievance = mongoose.models.Grievance || mongoose.model('Grievance', GrievanceSchema, 'grievances');
export const Notice = mongoose.models.Notice || mongoose.model('Notice', NoticeSchema, 'notices');
export const Placement = mongoose.models.Placement || mongoose.model('Placement', PlacementSchema, 'placements');
export const PlacementApplication = mongoose.models.PlacementApplication || mongoose.model('PlacementApplication', PlacementApplicationSchema, 'placement_applications');
export const Interview = mongoose.models.Interview || mongoose.model('Interview', InterviewSchema, 'interviews');
export const CampusLocation = mongoose.models.CampusLocation || mongoose.model('CampusLocation', CampusLocationSchema, 'campus_locations');
export const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema, 'assignments');
export const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema, 'submissions');
export const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema, 'notes');
export const SystemSetting = mongoose.models.SystemSetting || mongoose.model('SystemSetting', SystemSettingSchema, 'system_settings');
export const Timetable = mongoose.models.Timetable || mongoose.model('Timetable', TimetableSchema, 'timetables');
export const TimetableEntry = mongoose.models.TimetableEntry || mongoose.model('TimetableEntry', TimetableEntrySchema, 'timetable_entries');
export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema, 'messages');
export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema, 'notifications');
export const AIChatHistory = mongoose.models.AIChatHistory || mongoose.model('AIChatHistory', AIChatHistorySchema, 'ai_chat_history');
export const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema, 'activity_logs');
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema, 'audit_logs');
export const Skill = mongoose.models.Skill || mongoose.model('Skill', SkillSchema, 'skills');
export const StudentSkill = mongoose.models.StudentSkill || mongoose.model('StudentSkill', StudentSkillSchema, 'student_skills');
export const ResumeUpload = mongoose.models.ResumeUpload || mongoose.model('ResumeUpload', ResumeUploadSchema, 'resume_uploads');
export const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', AchievementSchema, 'achievements');
export const Semester = mongoose.models.Semester || mongoose.model('Semester', SemesterSchema, 'semesters');

// Helper mapper for generic queries
export function getModelByTable(table: string): mongoose.Model<any> | null {
  const mapping: Record<string, string> = {
    profiles: 'User',
    departments: 'Department',
    students: 'Student',
    faculty: 'Faculty',
    parents: 'Parent',
    courses: 'Course',
    subjects: 'Subject',
    attendance: 'Attendance',
    exams: 'Exam',
    results: 'Result',
    fees: 'Fee',
    payments: 'Payment',
    leave_requests: 'LeaveRequest',
    certificate_requests: 'CertificateRequest',
    grievances: 'Grievance',
    notices: 'Notice',
    placements: 'Placement',
    placement_applications: 'PlacementApplication',
    interviews: 'Interview',
    campus_locations: 'CampusLocation',
    assignments: 'Assignment',
    submissions: 'Submission',
    notes: 'Note',
    system_settings: 'SystemSetting',
    timetables: 'Timetable',
    timetable_entries: 'TimetableEntry',
    messages: 'Message',
    notifications: 'Notification',
    ai_chat_history: 'AIChatHistory',
    activity_logs: 'ActivityLog',
    audit_logs: 'AuditLog',
    skills: 'Skill',
    student_skills: 'StudentSkill',
    resume_uploads: 'ResumeUpload',
    achievements: 'Achievement',
    semesters: 'Semester'
  };

  const modelName = mapping[table];
  if (!modelName) return null;
  
  // Return the registered model
  switch (modelName) {
    case 'User': return User;
    case 'Department': return Department;
    case 'Student': return Student;
    case 'Faculty': return Faculty;
    case 'Parent': return Parent;
    case 'Course': return Course;
    case 'Subject': return Subject;
    case 'Attendance': return Attendance;
    case 'Exam': return Exam;
    case 'Result': return Result;
    case 'Fee': return Fee;
    case 'Payment': return Payment;
    case 'LeaveRequest': return LeaveRequest;
    case 'CertificateRequest': return CertificateRequest;
    case 'Grievance': return Grievance;
    case 'Notice': return Notice;
    case 'Placement': return Placement;
    case 'PlacementApplication': return PlacementApplication;
    case 'Interview': return Interview;
    case 'CampusLocation': return CampusLocation;
    case 'Assignment': return Assignment;
    case 'Submission': return Submission;
    case 'Note': return Note;
    case 'SystemSetting': return SystemSetting;
    case 'Timetable': return Timetable;
    case 'TimetableEntry': return TimetableEntry;
    case 'Message': return Message;
    case 'Notification': return Notification;
    case 'AIChatHistory': return AIChatHistory;
    case 'ActivityLog': return ActivityLog;
    case 'AuditLog': return AuditLog;
    case 'Skill': return Skill;
    case 'StudentSkill': return StudentSkill;
    case 'ResumeUpload': return ResumeUpload;
    case 'Achievement': return Achievement;
    case 'Semester': return Semester;
    default: return null;
  }
}
