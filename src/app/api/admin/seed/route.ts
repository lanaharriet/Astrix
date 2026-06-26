import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import { getModelByTable } from '@/lib/models';
import { isMongoConfigured, writeLocalDb } from '@/lib/db-server';
import * as seed from '@/lib/seed-data';

export async function POST() {
  try {
    const isMongo = isMongoConfigured();
    const defaultPassword = 'Password123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    // Prepare seeded profiles with password
    const seededProfiles = seed.SEED_PROFILES.map((profile) => ({
      ...profile,
      password: hashedPassword,
    }));

    if (isMongo) {
      await dbConnect();
      console.log('Seeding MongoDB Atlas Database...');

      // 1. Seed Profiles (User)
      const UserModel = getModelByTable('profiles');
      if (UserModel) {
        await UserModel.deleteMany({});
        for (const profile of seededProfiles) {
          await UserModel.create({
            _id: profile.id,
            fullName: profile.name,
            email: profile.email,
            password: profile.password,
            role: profile.role,
            phone: profile.phone,
            avatar: profile.avatar_url,
            isActive: true,
          });
        }
      }

      // 2. Seed Departments
      const DeptModel = getModelByTable('departments');
      if (DeptModel) {
        await DeptModel.deleteMany({});
        for (const dept of seed.SEED_DEPARTMENTS) {
          await DeptModel.create({
            _id: dept.id,
            name: dept.name,
            code: dept.code,
            description: dept.description,
          });
        }
      }

      // 3. Seed Students
      const StudentModel = getModelByTable('students');
      if (StudentModel) {
        await StudentModel.deleteMany({});
        for (const student of seed.SEED_STUDENTS) {
          await StudentModel.create({
            _id: student.profile_id, // Student ID matches profile_id in this design
            profile_id: student.profile_id,
            register_number: student.register_number,
            department_id: student.department_id,
            year: student.year,
            semester: student.semester,
            cgpa: student.cgpa,
          });
        }
      }

      // 4. Seed Faculty
      const FacultyModel = getModelByTable('faculty');
      if (FacultyModel) {
        await FacultyModel.deleteMany({});
        for (const fac of seed.SEED_FACULTY) {
          await FacultyModel.create({
            _id: fac.profile_id,
            profile_id: fac.profile_id,
            faculty_id: fac.faculty_id,
            department_id: fac.department_id,
            designation: fac.designation,
          });
        }
      }

      // 5. Seed Parents
      const ParentModel = getModelByTable('parents');
      if (ParentModel) {
        await ParentModel.deleteMany({});
        for (const parent of seed.SEED_PARENTS) {
          await ParentModel.create({
            _id: parent.profile_id,
            profile_id: parent.profile_id,
            student_id: parent.student_id,
            relation: parent.relation,
          });
        }
      }

      // 6. Seed Courses
      const CourseModel = getModelByTable('courses');
      if (CourseModel) {
        await CourseModel.deleteMany({});
        for (const course of seed.SEED_COURSES) {
          await CourseModel.create({
            _id: course.id,
            code: course.code,
            name: course.name,
            credits: course.credits,
            department_id: course.department_id,
          });
        }
      }

      // 7. Seed Semesters & Subjects
      const SemesterModel = getModelByTable('semesters');
      const SubjectModel = getModelByTable('subjects');
      const semId = 'sem-active';

      if (SemesterModel) {
        await SemesterModel.deleteMany({});
        await SemesterModel.create({
          _id: semId,
          name: 'Fall Semester 2026',
          start_date: '2026-06-01',
          end_date: '2026-11-30',
          is_active: true,
        });
      }

      if (SubjectModel) {
        await SubjectModel.deleteMany({});
        for (const sub of seed.SEED_SUBJECTS) {
          await SubjectModel.create({
            _id: sub.id,
            name: sub.name,
            code: sub.code,
            course_id: sub.course_id,
            faculty_id: sub.faculty_id,
            semester_id: semId,
          });
        }
      }

      // 8. Seed Attendance
      const AttendanceModel = getModelByTable('attendance');
      if (AttendanceModel) {
        await AttendanceModel.deleteMany({});
        for (const att of seed.SEED_ATTENDANCE) {
          await AttendanceModel.create({
            _id: att.id,
            student_id: att.student_id,
            subject_id: att.subject_id,
            date: att.date,
            status: att.status,
            qr_scanned: att.qr_scanned,
            marked_by: att.marked_by,
          });
        }
      }

      // 9. Seed Exams & Results
      const ExamModel = getModelByTable('exams');
      const ResultModel = getModelByTable('results');

      if (ExamModel) {
        await ExamModel.deleteMany({});
        for (const exam of seed.SEED_EXAMS) {
          await ExamModel.create({
            _id: exam.id,
            name: exam.name,
            type: exam.type,
            date: exam.date,
            max_marks: exam.max_marks,
          });
        }
      }

      if (ResultModel) {
        await ResultModel.deleteMany({});
        for (const res of seed.SEED_RESULTS) {
          await ResultModel.create({
            _id: res.id,
            student_id: res.student_id,
            exam_id: res.exam_id,
            subject_id: res.subject_id,
            marks_obtained: res.marks_obtained,
            grade: res.grade,
          });
        }
      }

      // 10. Seed Fees
      const FeeModel = getModelByTable('fees');
      if (FeeModel) {
        await FeeModel.deleteMany({});
        for (const fee of seed.SEED_FEES) {
          await FeeModel.create({
            _id: fee.id,
            student_id: fee.student_id,
            title: fee.title,
            amount: fee.amount,
            due_date: fee.due_date,
            status: fee.status,
          });
        }
      }

      // 11. Seed Payments
      const PaymentModel = getModelByTable('payments');
      if (PaymentModel) {
        await PaymentModel.deleteMany({});
        for (const pay of seed.SEED_PAYMENTS) {
          await PaymentModel.create({
            _id: pay.id,
            fee_id: pay.fee_id,
            amount: pay.amount,
            payment_method: pay.payment_method,
            transaction_id: pay.transaction_id,
            paid_at: pay.paid_at,
          });
        }
      }

      // 12. Seed Placements
      const PlacementModel = getModelByTable('placements');
      if (PlacementModel) {
        await PlacementModel.deleteMany({});
        for (const pl of seed.SEED_PLACEMENTS) {
          await PlacementModel.create({
            _id: pl.id,
            company_name: pl.company_name,
            industry: pl.industry,
            role: pl.role,
            salary_package: pl.salary_package,
            eligibility_criteria: pl.eligibility_criteria,
            status: pl.status,
            logo_url: pl.logo_url,
          });
        }
      }

      // 13. Seed Notices
      const NoticeModel = getModelByTable('notices');
      if (NoticeModel) {
        await NoticeModel.deleteMany({});
        for (const not of seed.SEED_NOTICES) {
          await NoticeModel.create({
            _id: not.id,
            title: not.title,
            content: not.content,
            target_role: not.target_role,
            created_by: not.created_by,
            created_at: not.created_at,
          });
        }
      }

      // 14. Seed Campus Locations
      const LocModel = getModelByTable('campus_locations');
      if (LocModel) {
        await LocModel.deleteMany({});
        for (const loc of seed.SEED_CAMPUS_LOCATIONS) {
          await LocModel.create({
            _id: loc.id,
            name: loc.name,
            block_name: loc.block_name,
            floor: loc.floor,
            room_number: loc.room_number,
            x: loc.x,
            y: loc.y,
            coordinates_json: { x: loc.x, y: loc.y },
          });
        }
      }

      // 15. Seed Assignments & Submissions & Notes
      const AsgModel = getModelByTable('assignments');
      const SubModel = getModelByTable('submissions');
      const NoteModel = getModelByTable('notes');

      if (AsgModel) {
        await AsgModel.deleteMany({});
        for (const asg of seed.SEED_ASSIGNMENTS) {
          await AsgModel.create({
            _id: asg.id,
            subject_id: asg.subject_id,
            title: asg.title,
            description: asg.description,
            due_date: asg.due_date,
            max_marks: asg.max_marks,
          });
        }
      }

      if (SubModel) {
        await SubModel.deleteMany({});
        for (const sub of seed.SEED_SUBMISSIONS) {
          await SubModel.create({
            _id: sub.id,
            assignment_id: sub.assignment_id,
            student_id: sub.student_id,
            content_url: sub.content_url,
            submitted_at: sub.submitted_at,
            marks_obtained: sub.marks_obtained,
            feedback: sub.feedback,
          });
        }
      }

      if (NoteModel) {
        await NoteModel.deleteMany({});
        for (const note of seed.SEED_NOTES) {
          await NoteModel.create({
            _id: note.id,
            user_id: note.user_id,
            title: note.title,
            content: note.content,
            subject_id: note.subject_id,
            is_public: note.is_public,
            file_url: note.file_url,
            created_at: note.created_at,
          });
        }
      }

      // 16. Seed Timetables & Entries
      const TimetableModel = getModelByTable('timetables');
      const TimetableEntryModel = getModelByTable('timetable_entries');

      if (TimetableModel) {
        await TimetableModel.deleteMany({});
        for (const tt of seed.SEED_TIMETABLES) {
          await TimetableModel.create({
            _id: tt.id,
            name: tt.name,
            semester_id: tt.semester_id,
            is_active: tt.is_active,
          });
        }
      }

      if (TimetableEntryModel) {
        await TimetableEntryModel.deleteMany({});
        for (const tte of seed.SEED_TIMETABLE_ENTRIES) {
          await TimetableEntryModel.create({
            _id: tte.id,
            timetable_id: tte.timetable_id,
            day_of_week: tte.day_of_week,
            start_time: tte.start_time,
            end_time: tte.end_time,
            subject_id: tte.subject_id,
            room_number: tte.room_number,
            faculty_id: tte.faculty_id,
            student_id: tte.student_id,
            type: tte.type,
          });
        }
      }

      // 17. Seed System Settings
      const SettingsModel = getModelByTable('system_settings');
      if (SettingsModel) {
        await SettingsModel.deleteMany({});
        for (const setting of seed.SEED_SYSTEM_SETTINGS) {
          await SettingsModel.create({
            _id: setting.key,
            key: setting.key,
            value: setting.value,
          });
        }
      }

      return NextResponse.json({
        status: 'success',
        message: 'MongoDB Atlas database collections successfully seeded.',
      });
    }

    // Local JSON Fallback Mode Seeding
    const defaultState = {
      profiles: seededProfiles, // Hashed passwords in fallback mode too!
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
      messages: [],
      notifications: [],
      ai_chat_history: [],
      activity_logs: [],
      audit_logs: [],
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
      resume_uploads: [],
      achievements: [
        { id: 'ach-1', student_id: 'u-student-1', title: 'Smart India Hackathon Winner', description: 'First prize in smart education category.', date: '2026-03-12', category: 'Hackathon' },
      ]
    };
    
    writeLocalDb(defaultState);
    return NextResponse.json({
      status: 'success',
      message: 'Local database reset and seeded successfully.',
    });
  } catch (error: any) {
    const { trackApiFailure } = require('@/lib/monitor');
    trackApiFailure('/api/admin/seed', error);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
