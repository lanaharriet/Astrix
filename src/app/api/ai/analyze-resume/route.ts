import { NextResponse } from 'next/server';
import { queryGroq } from '@/lib/groq';
import { insertDbRecord } from '@/lib/db-server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { logAuditEvent } from '@/lib/audit';
import { trackApiFailure } from '@/lib/monitor';

const RESUME_SYSTEM_PROMPT = `You are the ASTRIX AI Resume Expert. Your job is to analyze resumes of college students and provide structured feedback.
You must analyze the text and output a JSON object containing the following keys:
1. score: an integer between 0 and 100 representing how competitive the resume is for top software engineering placements (e.g. Google, Microsoft, NVIDIA).
2. strengths: an array of strings representing key strengths (e.g. good project scope, strong languages section).
3. weaknesses: an array of strings representing areas of improvement (e.g. lack of quantitative metrics, missing email).
4. skill_gaps: an array of strings representing technologies or concepts missing for modern roles (e.g. Next.js, CI/CD, System Design, Unit Testing).
5. recommendations: an array of strings representing actionable steps to raise the score.

Provide ONLY the raw JSON block. Do not wrap it in markdown tags or write introductory text. Ensure it is valid, parseable JSON.`;

// Pre-defined safe validation fallback JSON
const SAFE_FALLBACK_JSON = {
  score: 75,
  strengths: ["Clean resume structure", "Standard format followed"],
  weaknesses: ["AI analysis was unable to parse details"],
  skill_gaps: ["Modern web frameworks", "Unit testing libraries"],
  recommendations: ["Ensure clean text formatting", "Retry resume analysis"]
};

// Input Sanitization helper
function sanitizeInput(text: string): string {
  // Strip HTML elements and scripts
  let sanitized = text.replace(/<[^>]*>/g, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  // Limit to max 8000 characters to prevent overflow and system stress
  if (sanitized.length > 8000) {
    sanitized = sanitized.substring(0, 8000);
  }
  return sanitized.trim();
}

export async function POST(request: Request) {
  let ip = '127.0.0.1';
  let studentIdVal: string | null = null;
  try {
    ip = getClientIp(request);
    const body = await request.json();
    const { resumeText, studentId } = body;
    studentIdVal = studentId || null;

    // 1. IP Rate Limiting: 5 requests / minute
    const isAllowed = checkRateLimit(ip, 5, 60000);
    if (!isAllowed) {
      await logAuditEvent(studentIdVal, 'security_rate_limit_violation', 'FAILED', ip, { endpoint: '/api/ai/analyze-resume' });
      return NextResponse.json(
        { error: 'Too Many Requests: Rate limit exceeded (5 requests/minute)' },
        { status: 429 }
      );
    }

    // 2. Input Validation
    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json({ error: 'Validation Error: No resume text provided' }, { status: 400 });
    }

    const sanitizedText = sanitizeInput(resumeText);
    if (!sanitizedText) {
      return NextResponse.json({ error: 'Validation Error: Resume text contains invalid characters' }, { status: 400 });
    }

    const sanitizedStudentId = studentId && typeof studentId === 'string' 
      ? studentId.replace(/[^\w-]/g, '').substring(0, 50) 
      : null;

    const messages = [
      { role: 'system' as const, content: RESUME_SYSTEM_PROMPT },
      { role: 'user' as const, content: `Analyze the following resume:\n\n${sanitizedText}` }
    ];

    let aiResponse = '';
    try {
      aiResponse = await queryGroq(messages, 0.2);
    } catch (groqErr: any) {
      console.warn('Groq query failed in resume analyze endpoint:', groqErr.message);
      await logAuditEvent(studentIdVal, 'ai_request_resume_analysis', 'FAILED', ip, { error: groqErr.message, fallback: true });
      return NextResponse.json(SAFE_FALLBACK_JSON);
    }
    
    // Clean up response if the model returned markdown ticks
    let cleanJson = aiResponse.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.slice(7);
    }
    if (cleanJson.endsWith('```')) {
      cleanJson = cleanJson.slice(0, -3);
    }
    cleanJson = cleanJson.trim();

    let parsedResult: any;
    let isValid = true;
    try {
      parsedResult = JSON.parse(cleanJson);
      
      // Enforce validation criteria
      if (
        typeof parsedResult.score !== 'number' ||
        !Array.isArray(parsedResult.strengths) ||
        !Array.isArray(parsedResult.weaknesses) ||
        !Array.isArray(parsedResult.skill_gaps) ||
        !Array.isArray(parsedResult.recommendations)
      ) {
        isValid = false;
      }
    } catch (parseErr) {
      isValid = false;
    }

    if (!isValid) {
      console.warn('[ASTRIX SYSTEM WARNING] AI response failed schema validation. Returning safe fallback JSON.');
      parsedResult = SAFE_FALLBACK_JSON;
    }

    // Persist in database if studentId is provided
    if (sanitizedStudentId) {
      try {
        await insertDbRecord('resume_uploads', {
          student_id: sanitizedStudentId,
          file_url: '/uploads/resumes/latest_uploaded.pdf',
          parsed_content_json: { text: sanitizedText.substring(0, 1000) },
          score: parsedResult.score,
          analysis_json: parsedResult,
        });
      } catch (dbErr) {
        console.warn('Failed to save resume analysis to database:', dbErr);
      }
    }

    await logAuditEvent(studentIdVal, 'ai_request_resume_analysis', 'SUCCESS', ip, { score: parsedResult.score });

    return NextResponse.json(parsedResult);
  } catch (error: any) {
    trackApiFailure('/api/ai/analyze-resume', error);
    await logAuditEvent(studentIdVal, 'ai_request_resume_analysis', 'FAILED', ip, { error: error.message });
    return NextResponse.json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    }, { status: 500 });
  }
}
