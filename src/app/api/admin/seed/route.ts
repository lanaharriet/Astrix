import { NextResponse } from 'next/server';
import { isSupabaseConfigured, writeLocalDb, readLocalDb } from '@/lib/db-server';
import { createClient } from '@/lib/supabase/server';
import * as seed from '@/lib/seed-data';

export async function POST() {
  try {
    const supabaseActive = isSupabaseConfigured();

    if (supabaseActive) {
      const supabase = await createClient();
      console.log('Seeding Supabase Database...');

      // 1. Seed Profiles
      for (const profile of seed.SEED_PROFILES) {
        // We use upsert to avoid conflicts on unique email/id
        const { error } = await supabase.from('profiles').upsert(profile);
        if (error) console.error('Seed profile error:', error);
      }

      // 2. Seed Departments
      for (const dept of seed.SEED_DEPARTMENTS) {
        const { error } = await supabase.from('departments').upsert(dept);
        if (error) console.error('Seed department error:', error);
      }

      // 3. Seed Students
      for (const student of seed.SEED_STUDENTS) {
        const { error } = await supabase.from('students').upsert(student);
        if (error) console.error('Seed student error:', error);
      }

      // 4. Seed Faculty
      for (const fac of seed.SEED_FACULTY) {
        const { error } = await supabase.from('faculty').upsert(fac);
        if (error) console.error('Seed faculty error:', error);
      }

      // 5. Seed Parents
      for (const parent of seed.SEED_PARENTS) {
        const { error } = await supabase.from('parents').upsert(parent);
        if (error) console.error('Seed parent error:', error);
      }

      // 6. Seed Courses
      for (const course of seed.SEED_COURSES) {
        const { error } = await supabase.from('courses').upsert(course);
        if (error) console.error('Seed course error:', error);
      }

      // 7. Seed Subjects
      // Note: We need a semester first. Let's create an active semester if missing
      const semId = 'sem-active';
      await supabase.from('semesters').upsert({
        id: semId,
        name: 'Fall Semester 2026',
        start_date: '2026-06-01',
        end_date: '2026-11-30',
        is_active: true
      });

      for (const sub of seed.SEED_SUBJECTS) {
        const { error } = await supabase.from('subjects').upsert({
          ...sub,
          semester_id: semId
        });
        if (error) console.error('Seed subject error:', error);
      }

      // 8. Seed Attendance
      for (const att of seed.SEED_ATTENDANCE) {
        // Overwrite subject to valid sem-active
        const { error } = await supabase.from('attendance').upsert(att);
        if (error) console.error('Seed attendance error:', error);
      }

      // 9. Seed Results
      // Make sure exam exists
      for (const exam of seed.SEED_EXAMS) {
        await supabase.from('exams').upsert(exam);
      }
      for (const res of seed.SEED_RESULTS) {
        const { error } = await supabase.from('results').upsert(res);
        if (error) console.error('Seed results error:', error);
      }

      // 10. Seed Fees
      for (const fee of seed.SEED_FEES) {
        const { error } = await supabase.from('fees').upsert(fee);
        if (error) console.error('Seed fees error:', error);
      }

      // 11. Seed Payments
      for (const pay of seed.SEED_PAYMENTS) {
        const { error } = await supabase.from('payments').upsert(pay);
        if (error) console.error('Seed payments error:', error);
      }

      // 12. Seed Placements
      for (const pl of seed.SEED_PLACEMENTS) {
        const { error } = await supabase.from('placements').upsert({
          id: pl.id,
          company_id: undefined, // simplify relational mapping for demo seed if needed
          role: pl.role,
          salary_package: pl.salary_package,
          eligibility_criteria: pl.eligibility_criteria
        });
      }

      // 13. Seed Notices
      for (const not of seed.SEED_NOTICES) {
        const { error } = await supabase.from('notices').upsert(not);
        if (error) console.error('Seed notices error:', error);
      }

      // 14. Seed Campus Locations
      for (const loc of seed.SEED_CAMPUS_LOCATIONS) {
        const { error } = await supabase.from('campus_locations').upsert({
          id: loc.id,
          name: loc.name,
          block_name: loc.block_name,
          floor: loc.floor,
          room_number: loc.room_number,
          coordinates_json: { x: loc.x, y: loc.y }
        });
      }

      // 15. Seed Assignments & Notes
      for (const asg of seed.SEED_ASSIGNMENTS) {
        await supabase.from('assignments').upsert(asg);
      }
      for (const note of seed.SEED_NOTES) {
        await supabase.from('notes').upsert(note);
      }

      // 16. Seed Timetables & Timetable Entries
      for (const tt of seed.SEED_TIMETABLES) {
        await supabase.from('timetables').upsert(tt);
      }
      for (const tte of seed.SEED_TIMETABLE_ENTRIES) {
        await supabase.from('timetable_entries').upsert(tte);
      }

      return NextResponse.json({
        status: 'success',
        message: 'Supabase database tables successfully seeded.',
      });
    }

    // Local JSON reset
    const defaultState = {
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
    
    writeLocalDb(defaultState);
    return NextResponse.json({
      status: 'success',
      message: 'Local database reset and seeded successfully.',
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
