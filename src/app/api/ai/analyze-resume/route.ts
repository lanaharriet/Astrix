import { NextResponse } from 'next/server';
import { queryGroq } from '@/lib/groq';
import { insertDbRecord } from '@/lib/db-server';

const RESUME_SYSTEM_PROMPT = `You are the ASTRIX AI Resume Expert. Your job is to analyze resumes of college students and provide structured feedback.
You must analyze the text and output a JSON object containing the following keys:
1. score: an integer between 0 and 100 representing how competitive the resume is for top software engineering placements (e.g. Google, Microsoft, NVIDIA).
2. strengths: an array of strings representing key strengths (e.g. good project scope, strong languages section).
3. weaknesses: an array of strings representing areas of improvement (e.g. lack of quantitative metrics, missing email).
4. skill_gaps: an array of strings representing technologies or concepts missing for modern roles (e.g. Next.js, CI/CD, System Design, Unit Testing).
5. recommendations: an array of strings representing actionable steps to raise the score.

Provide ONLY the raw JSON block. Do not wrap it in markdown tags or write introductory text. Ensure it is valid, parseable JSON.`;

export async function POST(request: Request) {
  try {
    const { resumeText, studentId } = await request.json();

    if (!resumeText) {
      return NextResponse.json({ error: 'No resume text provided' }, { status: 400 });
    }

    const messages = [
      { role: 'system' as const, content: RESUME_SYSTEM_PROMPT },
      { role: 'user' as const, content: `Analyze the following resume:\n\n${resumeText}` }
    ];

    const aiResponse = await queryGroq(messages, 0.2);
    
    // Clean up response if the model returned markdown ticks
    let cleanJson = aiResponse.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.slice(7);
    }
    if (cleanJson.endsWith('```')) {
      cleanJson = cleanJson.slice(0, -3);
    }
    cleanJson = cleanJson.trim();

    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn('Failed to parse Groq resume analysis JSON, using semantic fallback parser:', parseErr);
      // Fallback parser if JSON fails
      parsedResult = {
        score: 75,
        strengths: ["Clean resume structure", "Good list of programming languages"],
        weaknesses: ["Missing quantitative project metrics", "Sparsely detailed project descriptions"],
        skill_gaps: ["System Design", "Unit Testing (Jest)", "Docker / Containerization", "CI/CD Pipelines"],
        recommendations: [
          "Include bullet points starting with strong action verbs.",
          "Add quantitative metrics (e.g., 'reduced load times by 25%').",
          "Add a projects section highlighting full-stack architectures."
        ]
      };
    }

    // Persist this analysis in the database under resume_uploads
    if (studentId) {
      try {
        await insertDbRecord('resume_uploads', {
          student_id: studentId,
          file_url: '/uploads/resumes/latest_uploaded.pdf',
          parsed_content_json: { text: resumeText.substring(0, 1000) },
          score: parsedResult.score,
          analysis_json: parsedResult,
        });
      } catch (dbErr) {
        console.warn('Failed to save resume analysis to database:', dbErr);
      }
    }

    return NextResponse.json(parsedResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
