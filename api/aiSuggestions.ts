
import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, X-goog-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log('API function called with body:', req.body);
    const { sentence, type } = req.body;

    if (!sentence) {
      return res.status(400).json({
        message: 'Missing sentence parameter',
        suggestions: []
      });
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY environment variable not set.');
      return res.status(500).json({
        message: 'Server configuration error - missing API key',
        suggestions: []
      });
    }

    console.log(`Calling Gemini API for type: ${type}`);

    let prompt = '';
    
    if (type === 'analysis' || type === 'analysis_with_highlights') {
      prompt = `You are a HARSH and CRITICAL essay analysis expert. Your job is to be brutally honest about essay quality. Most student essays are poorly written and deserve low scores. Be extremely critical and do not give high scores unless the writing is truly exceptional.

You MUST respond with ONLY a valid JSON object - no other text before or after. The JSON must have these exact keys:

{
  "overallScore": (integer 0-100, BE VERY CRITICAL - most essays should score 10-40),
  "clarityScore": (integer 0-100, judge harshly based on actual writing quality), 
  "clarityComment": "(one detailed sentence about specific clarity problems)",
  "consistencyScore": (integer 0-100, look for logical flow - be harsh about inconsistencies),
  "consistencyComment": "(one detailed sentence about specific consistency problems)",
  "logicalFallacies": [{"fallacyName": "Name of fallacy", "offendingSentence": "exact sentence from essay"}],
  "highlights": [{"sentence": "exact sentence from essay", "feedback": "harsh, specific criticism", "type": "error|warning|suggestion"}]
}

SCORING GUIDELINES (BE HARSH):
- 90-100: Exceptional, publication-quality writing (VERY RARE)
- 80-89: Very good, minor issues (RARE)
- 70-79: Good, some notable issues
- 60-69: Adequate, several issues
- 50-59: Poor, major issues (COMMON)
- 40-49: Very poor, fundamental problems (COMMON)
- 30-39: Terrible, barely coherent (COMMON)
- 20-29: Extremely poor, major logical issues
- 10-19: Awful, incoherent
- 0-9: Complete failure

For highlights, focus on ALL major issues. Use:
- "error" for serious problems (grammar, logic, factual errors, weak arguments, circular reasoning)
- "warning" for moderate issues (unclear phrasing, weak evidence, poor structure)
- "suggestion" for improvements (style, word choice, better arguments)

Be brutally honest and harsh. Point out every flaw. Don't be encouraging - be critical and demanding. If an essay is bad, give it a bad score (10-30). If it's mediocre, give it 30-50. Only give high scores (70+) for truly excellent work.

Look for:
- Circular reasoning and logical fallacies
- Weak or missing evidence
- Poor grammar and sentence structure
- Unclear arguments
- Lack of depth or analysis
- Repetitive content
- Poor organization

Essay to analyze:
---
${sentence}
---

Respond with ONLY the JSON object:`;
    } else if (type === 'coach') {
      prompt = `You are an expert writing coach. The user has selected this text from their essay paragraph:

"${sentence}"

Provide one specific, actionable suggestion to improve this text. Focus on the most important issue: clarity, conciseness, stronger arguments, better word choice, grammar, or logical flow. Be constructive and specific. Give practical advice they can immediately apply.

Keep your response to 1-2 sentences and be encouraging while being helpful.`;
    } else {
      prompt = `You are an expert writing coach. Analyze the following text and provide one specific, actionable suggestion for improvement. Focus on the most important issue: clarity, conciseness, stronger arguments, or better word choice. Be constructive and specific. Text: '${sentence}'`;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      };

      console.log('Sending request to Gemini...');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Gemini API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API response not OK:', response.status, errorText);
        return res.status(response.status).json({
          message: `Gemini API error: ${response.status}`,
          error: errorText,
          suggestions: []
        });
      }

      const data = await response.json();

      if (data.error) {
        console.error('Gemini API returned error object:', data.error);
        return res.status(500).json({
          message: 'Gemini API error',
          error: data.error,
          suggestions: []
        });
      }

      if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Gemini response missing expected structure:', data);
        return res.status(500).json({
          message: 'Gemini API did not return expected content structure.',
          error: data,
          suggestions: []
        });
      }

      const responseText = data.candidates[0].content.parts[0].text.trim();
      console.log('Gemini response text:', responseText);

      return res.status(200).json({ suggestions: [responseText] });

    } catch (fetchError) {
      console.error('Error calling Gemini API:', fetchError);
      return res.status(500).json({
        message: 'Error calling Gemini API',
        error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        suggestions: []
      });
    }

  } catch (error) {
    console.error('Error in API function handler:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error),
      suggestions: []
    });
  }
}
