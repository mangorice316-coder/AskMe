export type ToneType = 'Formal' | 'Assertive' | 'Urgent' | 'Legal';

export interface ComplaintDetails {
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  senderAddress: string;
  authorityName: string;
  authorityAddress: string;
  authorityEmail?: string;
  category: string;
  description: string;
  issueLocation: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  date: string;
  language?: string;
  tone?: ToneType;
  provider?: 'gemini' | 'openai';
  imageBase64?: string;
}

const LEGAL_REFERENCES: Record<string, string> = {
  'Roads & Pavement':
    'Reference applicable provisions such as the Municipal Corporation Act, Motor Vehicles Act, and Right to Safe Roads under Article 21 of the Indian Constitution.',
  'Waste & Sanitation':
    'Reference Solid Waste Management Rules 2016, Municipal Solid Wastes Rules, and local body obligations under the Municipal Corporation Act.',
  'Water & Sewage':
    'Reference Water (Prevention and Control of Pollution) Act 1974, Municipal Water Supply bylaws, and Right to Clean Water under Article 21.',
  'Street Lighting':
    'Reference Municipal Corporation Act obligations regarding public lighting and public night safety.',
  'Public Safety & Health':
    'Reference Prevention of Cruelty to Animals Act 1960 (if animal-related), Public Health Act, and Municipal bylaws regarding public nuisance.',
  'Official Misconduct / Negligence':
    'Reference Prevention of Corruption Act 1988, Civil Services (Conduct) Rules regarding dereliction of duty, and Right to Public Services Act.',
  Other:
    'Reference applicable Municipal Corporation Act provisions and grievance redressal under the Right to Information Act 2005.',
};

const TONE_INSTRUCTIONS: Record<ToneType, string> = {
  Formal: 'Maintain a respectful, polished, and professional tone throughout.',
  Assertive: 'Use a firm, direct tone emphasizing that inaction is unacceptable and immediate results are expected.',
  Urgent: 'Write with maximum urgency emphasizing imminent risk to public safety with a 48-hour deadline.',
  Legal: 'Adopt a formal legal notice tone referencing statutory obligations and escalation to courts/tribunals.',
};

const API_TIMEOUT_MS = 30_000;

function sanitize(input: string): string {
  return input
    .replace(/^={3,}.*={3,}$/gm, '')
    .replace(/\b(system|assistant|user)\s*:/gi, '')
    .replace(/\n{4,}/g, '\n\n')
    .trim();
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = API_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('The AI service took too long to respond. Please check your internet connection and try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function cleanMarkdownFences(text: string): string {
  return text.replace(/^```[a-zA-Z]*\n?/g, '').replace(/\n?```$/g, '').trim();
}

function buildPrompt(details: ComplaintDetails, imageBase64?: string): string {
  const targetLanguage = details.language || 'English';
  const tone: ToneType = details.tone || 'Formal';
  const toneInstruction = TONE_INSTRUCTIONS[tone];
  const legalRef = LEGAL_REFERENCES[details.category] || LEGAL_REFERENCES['Other'];

  return `
You are an expert in public relations, civic law, and formal correspondence.
Write a highly professional and persuasive complaint letter to a public works authority.

=== COMPLAINT DETAILS ===
- Sender's Name: ${sanitize(details.senderName)}
- Sender's Phone: ${sanitize(details.senderPhone)}
- Sender's Email: ${sanitize(details.senderEmail)}
- Sender's Address: ${sanitize(details.senderAddress)}
- Target Authority: ${sanitize(details.authorityName)}
- Authority Address: ${sanitize(details.authorityAddress)}
- Authority Email: ${details.authorityEmail ? sanitize(details.authorityEmail) : 'Not Provided'}
- Issue Category: ${details.category}
- Issue Description: ${sanitize(details.description)}
- Issue Location: ${sanitize(details.issueLocation)}
- Urgency Level: ${details.urgency}
- Date: ${details.date}
- Letter Tone: ${tone}

${imageBase64 ? '=== VISUAL EVIDENCE ===\nPhoto evidence is attached. Carefully analyze the photo and integrate specific visual observations (severity, damage scale, hazard level) into the letter.' : ''}

=== TONE INSTRUCTIONS ===
${toneInstruction}

=== LEGAL FRAMEWORK ===
${legalRef}

=== LETTER STRUCTURE ===
1. Format as formal letter: Sender Details → Date → Recipient Address → Subject Line → Salutation → Body (3-4 paragraphs) → Call to Action with deadline → Formal sign-off.
2. Subject line should be bold and descriptive.
3. Outline specific problem clearly with exact location.
4. Elaborate on consequences proportional to urgency.
5. End with professional sign-off including sender details.

=== OUTPUT RULES ===
1. Translate ENTIRE letter to: ${targetLanguage}.
2. Do NOT include markdown code blocks.
3. Output only the raw formatted text of the letter.
`.trim();
}

export async function generateAILetter(details: ComplaintDetails, apiKey: string, imageBase64?: string): Promise<string> {
  const prompt = buildPrompt(details, imageBase64);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const parts: any[] = [{ text: prompt }];
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    });
  }

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts }] }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error('AI rate limit reached. Please wait a moment and try again.');
    if (response.status === 401 || response.status === 403) throw new Error('Invalid or expired Gemini API key in .env.local.');
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `HTTP status ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('The AI returned an empty response. Please try again.');
  return cleanMarkdownFences(text);
}

export async function generateAILetterOpenAI(details: ComplaintDetails, apiKey: string, imageBase64?: string): Promise<string> {
  const prompt = buildPrompt(details, imageBase64);
  const url = 'https://api.openai.com/v1/chat/completions';
  const model = imageBase64 ? 'gpt-4o' : 'gpt-4o-mini';

  const contentArray: any[] = [{ type: 'text', text: prompt }];
  if (imageBase64) {
    const base64Prefix = imageBase64.startsWith('data:image') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
    contentArray.push({ type: 'image_url', image_url: { url: base64Prefix } });
  }

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: contentArray }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error('AI rate limit reached. Please wait a moment and try again.');
    if (response.status === 401 || response.status === 403) throw new Error('Invalid or expired OpenAI API key in .env.local.');
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `HTTP status ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('The AI returned an empty response. Please try again.');
  return cleanMarkdownFences(text);
}
