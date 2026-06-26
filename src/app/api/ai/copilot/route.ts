import { NextResponse } from 'next/server';
import { queryGroq, ChatMessage } from '@/lib/groq';
import { insertDbRecord, getDbRecords } from '@/lib/db-server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { logAuditEvent } from '@/lib/audit';
import { trackApiFailure } from '@/lib/monitor';

const COPILOT_SYSTEM_PROMPT = `You are ASTRIX Campus Copilot, an advanced AI academic advisor for ASTRIX Smart Campus Ecosystem.
You have access to real-time database context regarding the requesting user (provided below).
Use the user context details to answer queries. For example, if the user asks about their attendance, class timetables, fees, or placements, query the user context.
Always answer naturally and professionally using this actual database info.
If the database context says a record is missing or not found, kindly let the user know, and never invent records.

Tone: Professional, academically authoritative, supportive, and elegant.
Formatting: Use clean Markdown. Keep answers concise for mobile readability.
If the user's question cannot be answered using the provided context or general campus information, politely direct them to check the notice board or contact their department HOD.`;

// Input Sanitization helper
function sanitizeText(text: string): string {
  let sanitized = text.replace(/<[^>]*>/g, ''); // strip HTML tags
  sanitized = sanitized.replace(/javascript:/gi, '');
  if (sanitized.length > 4000) {
    sanitized = sanitized.substring(0, 4000);
  }
  return sanitized.trim();
}

// RAG: Fetch user database records and format as context prompt
async function getContextPrompt(userId: string): Promise<string> {
  try {
    const [
      profiles,
      departments,
      students,
      faculty,
      parents,
      subjects,
      attendance,
      fees,
      timetableEntries,
      placements,
      placementApps
    ] = await Promise.all([
      getDbRecords('profiles'),
      getDbRecords('departments'),
      getDbRecords('students'),
      getDbRecords('faculty'),
      getDbRecords('parents'),
      getDbRecords('subjects'),
      getDbRecords('attendance'),
      getDbRecords('fees'),
      getDbRecords('timetable_entries'),
      getDbRecords('placements'),
      getDbRecords('placement_applications')
    ]);

    const profile = profiles.find((p: any) => p.id === userId || p._id === userId);
    if (!profile) return 'User Profile Context: Profile not found in database.';

    const role = profile.role;
    let name = profile.fullName || profile.name || '';
    const email = profile.email || '';
    let studentId = '';

    let studentProfile: any = null;
    if (role === 'student') {
      studentId = userId;
      studentProfile = students.find((s: any) => s.profile_id === userId);
    } else if (role === 'parent') {
      const parentRecord = parents.find((p: any) => p.profile_id === userId);
      if (parentRecord) {
        studentId = parentRecord.student_id;
        studentProfile = students.find((s: any) => s.profile_id === studentId);
        const stProf = profiles.find((p: any) => p.id === studentId || p._id === studentId);
        if (stProf) name += ` (Parent of Student: ${stProf.fullName || stProf.name})`;
      }
    }

    let context = `--- USER CONTEXT INFORMATION ---
User Profile ID: ${userId}
Name: ${name}
Email: ${email}
Role: ${role}
`;

    // 1. Department info
    let deptId = '';
    if (role === 'student' && studentProfile) {
      deptId = studentProfile.department_id;
    } else if (role === 'faculty') {
      const facRecord = faculty.find((f: any) => f.profile_id === userId);
      if (facRecord) deptId = facRecord.department_id;
    }
    if (deptId) {
      const dept = departments.find((d: any) => d.id === deptId || d._id === deptId);
      if (dept) {
        context += `Department: ${dept.name} (${dept.code})\n`;
      }
    }

    // 2. Attendance Stats
    if (studentId) {
      const studentAttendance = attendance.filter((a: any) => a.student_id === studentId);
      if (studentAttendance.length > 0) {
        const subCounts: Record<string, { present: number; total: number }> = {};
        studentAttendance.forEach((a: any) => {
          if (!subCounts[a.subject_id]) {
            subCounts[a.subject_id] = { present: 0, total: 0 };
          }
          subCounts[a.subject_id].total++;
          if (a.status === 'Present' || a.status === 'Late') {
            subCounts[a.subject_id].present++;
          }
        });

        context += `\nSubject-wise Attendance Statistics:\n`;
        let totalPresent = 0;
        let totalClasses = 0;
        Object.entries(subCounts).forEach(([subId, counts]) => {
          const sub = subjects.find((s: any) => s.id === subId || s._id === subId);
          const subName = sub ? sub.name : subId;
          const pct = Math.round((counts.present / counts.total) * 100);
          context += `- ${subName} (${subId}): Present ${counts.present}/${counts.total} (${pct}%)\n`;
          totalPresent += counts.present;
          totalClasses += counts.total;
        });
        const overallPct = Math.round((totalPresent / totalClasses) * 100);
        context += `Overall Attendance Percentage: ${overallPct}% (Target: Minimum 75%)\n`;
      } else {
        context += `\nAttendance Records: No attendance records found.\n`;
      }
    }

    // 3. Timetable Schedule
    let userEntries: any[] = [];
    if (studentId) {
      userEntries = timetableEntries.filter((e: any) => e.student_id === studentId && e.type === 'class');
    } else if (role === 'faculty') {
      userEntries = timetableEntries.filter((e: any) => e.faculty_id === userId);
    }
    if (userEntries.length > 0) {
      const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      context += `\nTimetable Schedule Entries:\n`;
      userEntries.forEach((e: any) => {
        const sub = subjects.find((s: any) => s.id === e.subject_id || s._id === e.subject_id);
        const subName = sub ? sub.name : e.subject_id;
        context += `- ${days[e.day_of_week]}: ${e.start_time}-${e.end_time} | Subject: ${subName} | Room: ${e.room_number} | Session Type: ${e.type}\n`;
      });
    } else {
      context += `\nTimetable Schedule: No entries published in database.\n`;
    }

    // 4. Fees
    if (studentId) {
      const studentFees = fees.filter((f: any) => f.student_id === studentId);
      if (studentFees.length > 0) {
        context += `\nFinancial Dues:\n`;
        studentFees.forEach((f: any) => {
          context += `- Invoice: ${f.title} | Amount Due: ₹${f.amount.toLocaleString()} | Due Date: ${f.due_date} | Status: ${f.status}\n`;
        });
      } else {
        context += `\nFinancial Status: All dues are fully settled.\n`;
      }
    }

    // 5. Placements
    if (studentId) {
      const studentApps = placementApps.filter((a: any) => a.student_id === studentId);
      if (studentApps.length > 0) {
        context += `\nPlacement Applications Status:\n`;
        studentApps.forEach((app: any) => {
          const pl = placements.find((p: any) => p.id === app.placement_id || p._id === app.placement_id);
          const compName = pl ? pl.company_name : 'Unknown Company';
          const plRole = pl ? pl.role : 'Job Opening';
          context += `- Placement: ${compName} - ${plRole} | Application Status: ${app.status} | Submitted: ${app.applied_at}\n`;
        });
      }
    }

    context += `\n-------------------------------\n`;
    return context;
  } catch (err: any) {
    console.error('Failed to resolve context prompt:', err);
    return 'User Context Info: Failed to query database context due to server error.';
  }
}

export async function POST(request: Request) {
  let ip = '127.0.0.1';
  let userIdVal: string | null = null;
  try {
    ip = getClientIp(request);
    const body = await request.json();
    const { messages, userId } = body;
    userIdVal = userId || null;

    // 1. IP Rate Limiting: 20 requests / minute
    const isAllowed = checkRateLimit(ip, 20, 60000);
    if (!isAllowed) {
      await logAuditEvent(userIdVal, 'security_rate_limit_violation', 'FAILED', ip, { endpoint: '/api/ai/copilot' });
      return NextResponse.json(
        { error: 'Too Many Requests: Rate limit exceeded (20 requests/minute)' },
        { status: 429 }
      );
    }

    // 2. Input Validation
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Validation Error: Invalid messages payload' }, { status: 400 });
    }

    // Sanitize user inputs to prevent injection and filter overflow
    const sanitizedMessages = messages.map((m: any) => ({
      role: (m.role === 'user' ? 'user' : m.role === 'assistant' ? 'assistant' : 'system') as 'user' | 'assistant' | 'system',
      content: sanitizeText(m.content || '')
    }));

    // 3. RAG: Retrieve database context if user ID is present
    let finalPrompt = COPILOT_SYSTEM_PROMPT;
    if (userId && typeof userId === 'string') {
      const sanitizedUserId = userId.replace(/[^\w-]/g, '').substring(0, 50);
      const dbContext = await getContextPrompt(sanitizedUserId);
      finalPrompt = `${COPILOT_SYSTEM_PROMPT}\n\n${dbContext}`;
    }

    // Keep last 6 messages to preserve conversational history without bloat
    const formattedMessages: ChatMessage[] = [
      { role: 'system', content: finalPrompt },
      ...sanitizedMessages.slice(-6)
    ];

    const responseContent = await queryGroq(formattedMessages, 0.4);

    // Persist to audit/chat logs table in database if user ID exists
    if (userId) {
      const lastUserMsg = sanitizedMessages[sanitizedMessages.length - 1]?.content || '';
      try {
        await insertDbRecord('ai_chat_history', {
          user_id: userId,
          message: lastUserMsg,
          response: responseContent,
        });
      } catch (dbErr) {
        console.warn('Failed to log AI chat to database:', dbErr);
      }
    }

    return NextResponse.json({ response: responseContent });
  } catch (error: any) {
    trackApiFailure('/api/ai/copilot', error);
    await logAuditEvent(userIdVal, 'ai_request_copilot', 'FAILED', ip, { error: error.message });
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    }, { status: 500 });
  }
}
