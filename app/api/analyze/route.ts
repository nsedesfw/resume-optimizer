import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  const { resume, jobDescription } = await request.json();

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analyze this resume against the job description. Return ONLY valid JSON, no markdown, no backticks, just raw JSON with this exact structure:
{
  "ats_score": <number 0-100>,
  "score_label": "<Weak match | Fair match | Good match | Strong match>",
  "score_summary": "<one sentence summary>",
  "keywords_found": ["keyword1", "keyword2"],
  "keywords_missing": ["keyword1", "keyword2"],
  "rewritten_bullets": "• bullet 1\n• bullet 2\n• bullet 3",
  "cover_letter": "<3 paragraph cover letter>",
  "red_flags": "⚠ flag 1\n⚠ flag 2"
}

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());

  return Response.json(parsed);
}