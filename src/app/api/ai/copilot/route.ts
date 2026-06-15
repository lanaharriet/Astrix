import { NextResponse } from 'next/server';
import { queryGroq, ChatMessage } from '@/lib/groq';
import { insertDbRecord } from '@/lib/db-server';

const COPILOT_SYSTEM_PROMPT = `You are ASTRIX Campus Copilot, an advanced AI academic advisor for ASTRIX Smart Campus Ecosystem.
You have access to information regarding:
1. Timetables: Class hours, blocks, room numbers, and faculty cabins.
2. Attendance: Requirements (75% minimum), consequences of shortage (hall ticket block), predictor calculations.
3. Fee Details: Tuition fees, exam registration fees, hostel rent, and payment due dates.
4. Academic Syllabus: Courses, credits, subject codes, marks, internal assessments, model exams, and results grading.
5. Placements: active recruitment drives, company criteria (Google, Microsoft, NVIDIA), salaries (LPA).
6. Campus Layout: locations, routes, library floors, auditorium seats, and medical block availability.

Your tone should be highly professional, elegant, helpful, and academically authoritative. 
Always structure your responses using clean Markdown. Bullet points, bold headers, and code sections are highly encouraged.
Be concise. Keep answers readable on mobile screens. Do not make up any facts outside your scope. If you don't know the answer, politely ask the student to contact their HOD or check the notice board.`;

export async function POST(request: Request) {
  try {
    const { messages, userId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array provided' }, { status: 400 });
    }

    // Format chat messages and prepend system prompt
    const formattedMessages: ChatMessage[] = [
      { role: 'system', content: COPILOT_SYSTEM_PROMPT },
      ...messages.slice(-6).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })) // Keep last 6 messages for context window
    ];

    const responseContent = await queryGroq(formattedMessages, 0.4);

    // Save to AI chat history table in database if userId is provided
    if (userId) {
      const lastUserMsg = messages[messages.length - 1]?.content || '';
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
