import { GoogleGenAI } from "@google/genai";
import { GeneratorOptions, UploadedFile, JobMode } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMotivationLetter = async (
  jobInput: string,
  jobMode: JobMode,
  cvText: string,
  cvFile: UploadedFile | null,
  options: GeneratorOptions
): Promise<string> => {
  const ai = getAiClient();

  // Determine tone instruction
  const toneInstruction = options.tone === 'match_cv'
    ? "Analyze the writing style, vocabulary, and formality level of the provided CV. Write the motivation letter using a Tone and Voice that matches the candidate's CV."
    : `Use a ${options.tone} tone.`;

  // Determine length instruction
  let lengthInstruction = "";
  switch (options.length) {
    case 'short':
      lengthInstruction = "Keep the letter concise, approximately 200-250 words (ideal for quick applications).";
      break;
    case 'detailed':
      lengthInstruction = "Write a detailed letter, approximately 400-450 words (ideal for senior/specialized roles), providing in-depth analysis of fit.";
      break;
    case 'standard':
    default:
      lengthInstruction = "Write a standard length letter, approximately 300-350 words.";
      break;
  }

  // Construct prompt based on Job Mode
  let promptText = `
ROLE:
You are a senior recruiter and professional copywriter specializing in job application letters.

GOAL:
Generate a high-quality, personalized, and ready-to-send motivation letter based on the provided job vacancy and CV.

INPUT:
`;

  const tools: any[] = [];

  if (jobMode === 'url') {
    promptText += `
Job Vacancy URL:
${jobInput}

(Please use Google Search to access and analyze the job description, requirements, and company culture from this URL).
`;
    // Enable Google Search tool
    tools.push({ googleSearch: {} });
  } else {
    promptText += `
Job Vacancy:
<<<
${jobInput}
>>>
`;
  }

  if (cvFile) {
    promptText += `
Candidate CV:
(Provided as an attachment to this message)
`;
  } else {
    promptText += `
Candidate CV:
<<<
${cvText}
>>>
`;
  }

  promptText += `
OPTIONAL CONTEXT:
- Candidate name: ${options.candidateName || 'The Candidate'}
- Job title: ${options.jobTitle || 'the position'}
- Company name: ${options.companyName || 'the company'}
- Tone Instruction: ${toneInstruction}
- Length Instruction: ${lengthInstruction}
- Language: ${options.language}

INSTRUCTIONS:
1. Analyze the job vacancy (from text or URL) and identify key requirements and responsibilities.
2. Analyze the CV (text or attachment) and select only the most relevant experience and skills.
3. Write a motivation letter that clearly connects the candidate’s background to the job requirements.
4. Avoid clichés, generic phrases, and AI-sounding language (e.g., "I am writing to express my interest", "I was thrilled to see"). Start strong.
5. Use clear, natural, and professional ${options.language}.
6. ${lengthInstruction}

STRUCTURE:
- Introduction: interest in the role and company (mention specifics if available).
- Core paragraph(s): relevant experience and skills aligned with the vacancy.
- Motivation and added value: why this specific match works.
- Closing: invitation for an interview.

OUTPUT:
Provide only the final motivation letter text. Do not include markdown code blocks, explanations, bullet points outside the letter flow, or placeholders like [Name]. Use the provided candidate name if available, otherwise use a generic placeholder that is easy to spot.
`;

  try {
    const parts: any[] = [{ text: promptText }];

    if (cvFile) {
      parts.push({
        inlineData: {
          mimeType: cvFile.mimeType,
          data: cvFile.data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts }, // Use object structure for parts
      config: {
        // High temperature for creativity in writing, but controlled
        temperature: 0.7,
        tools: tools.length > 0 ? tools : undefined,
      }
    });

    if (!response.text) {
      throw new Error("No content generated from the model.");
    }

    return response.text.trim();
  } catch (error) {
    console.error("Error generating letter:", error);
    throw error;
  }
};