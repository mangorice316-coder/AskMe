import { matchAuthority, AuthorityMatchResult, AuthorityRecord } from './authorityDirectory';

export interface UserComplaintInput {
  textDescription?: string;
  voiceTranscript?: string;
  photos: {
    uri: string;
    base64?: string;
    isFromCamera?: boolean;
    detectedGps?: { latitude: number; longitude: number };
  }[];
  problemLocation: {
    address: string;
    city?: string;
    district?: string;
    state?: string;
    coordinates?: { latitude: number; longitude: number };
  };
  senderDetails?: {
    name?: string;
    phone?: string;
    email?: string;
    residentialAddress?: string;
  };
  preferredTone?: 'Formal' | 'Assertive' | 'Urgent' | 'Legal';
  preferredLanguage?: string;
}

export interface ComplaintAnalysisResult {
  // Input Normalization
  normalizedDescription: string;
  
  // Multimodal Structured Understanding
  userProvidedFacts: string[];
  observedEvidence: string[];
  aiInterpretation: string;

  // Classification & Severity
  mainIssue: string;
  category: string;
  severity: 'Routine' | 'Moderate' | 'High' | 'Urgent';
  severityExplanation: string;
  publicImpact: string;
  
  // Smart Evidence / Clarification
  missingInfo: string[];
  clarificationQuestions: string[];

  // Authority Intelligence
  authorityMatch: AuthorityMatchResult;

  // Generated Formal Letter
  formalLetter: string;
  letterSubject: string;
}

const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Clean markdown JSON wrappers
 */
function extractJsonFromResponse(raw: string): any {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

/**
 * Main ASKME Intelligence Orchestrator
 * Sequentially executes:
 * 1. Multimodal Understanding with Gemini
 * 2. Authority Jurisdiction Matching
 * 3. Formal Letter Construction
 */
export async function analyzeAndGenerateComplaint(
  input: UserComplaintInput,
  apiKey: string,
  onStageChange?: (stage: 'understanding' | 'analyzing' | 'locating' | 'identifying' | 'preparing') => void
): Promise<ComplaintAnalysisResult> {
  // --- STAGE 1: Input Normalization ---
  onStageChange?.('understanding');
  const combinedDesc = [
    input.textDescription?.trim() ? `User Text: ${input.textDescription.trim()}` : '',
    input.voiceTranscript?.trim() ? `Voice Transcript: ${input.voiceTranscript.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n\n') || 'Citizen submitted visual evidence for civic action.';

  // --- STAGE 2: Multimodal Gemini Analysis ---
  onStageChange?.('analyzing');

  let parsedAiData: any = null;

  if (apiKey) {
    try {
      const prompt = `
You are the ASKME Civic Intelligence Engine. Analyze the citizen complaint and attached photographs.
Your duty is to produce an accurate, objective, structured civic evaluation without exaggeration or fabrication.

=== INPUT DATA ===
Reported Problem Location: ${input.problemLocation.address || 'Unspecified location'}
City / District / State: ${input.problemLocation.city || ''}, ${input.problemLocation.district || ''}, ${input.problemLocation.state || ''}
Citizen Description / Voice:
${combinedDesc}
${input.photos.length > 0 ? `\nNumber of photos attached: ${input.photos.length}. Analyze visible details.` : ''}

=== STRICT SEPARATION RULES ===
1. USER-PROVIDED FACTS: Strictly facts explicitly told by citizen (e.g. location, timing, claims).
2. OBSERVED EVIDENCE: Directly visible in the photo or audible in voice (e.g. "large pothole of approx 1-2ft depth filled with dirty water", "uncollected domestic trash bags overflowing on street"). If no photo, state "No photographic evidence provided".
3. AI INTERPRETATION: Logical classification and potential risks. NEVER present assumptions as confirmed facts.
4. SEVERITY ASSESSMENT: 'Routine', 'Moderate', 'High', or 'Urgent'. Give honest reason based on safety, waterlogging, traffic hazard, or public health.
5. CATEGORY: One of: 'Roads & Transportation', 'Waste Management', 'Water Supply & Sewage', 'Street Lighting', 'Public Health & Safety', 'Electricity', 'Railways', 'Environment & Pollution', 'General'.
6. CLARIFICATION QUESTIONS: If location specifics (landmark/road type), problem duration, or critical details are missing, provide 1-2 polite questions.

Respond ONLY with valid raw JSON adhering to this schema:
{
  "mainIssue": "short headline of issue",
  "category": "Roads & Transportation",
  "userProvidedFacts": ["fact 1", "fact 2"],
  "observedEvidence": ["visual evidence 1"],
  "aiInterpretation": "Clear, objective explanation of the civic risk",
  "severity": "Moderate",
  "severityExplanation": "Explanation based on public safety without exaggeration",
  "publicImpact": "Impact on local pedestrians, motorists, or sanitation",
  "missingInfo": ["exact road landmark", "how long it has persisted"],
  "clarificationQuestions": ["Is this road a National Highway or an internal residential street?"]
}
`.trim();

      const parts: any[] = [{ text: prompt }];

      // Include photos if available
      input.photos.forEach((photo) => {
        if (photo.base64) {
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: photo.base64,
            },
          });
        }
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts }] }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawContent) {
          parsedAiData = extractJsonFromResponse(rawContent);
        }
      }
    } catch (err) {
      console.warn('Gemini multimodal analysis error, falling back to local heuristic:', err);
    }
  }

  // Fallback heuristic if AI unavailable or offline
  if (!parsedAiData) {
    parsedAiData = generateLocalHeuristicUnderstanding(combinedDesc, input.photos.length);
  }

  // --- STAGE 3 & 4: Locating and Authority Resolution ---
  onStageChange?.('locating');
  await new Promise((r) => setTimeout(r, 400)); // Smooth UX pacing

  onStageChange?.('identifying');
  const authorityMatch = matchAuthority({
    category: parsedAiData.category || 'General',
    description: `${parsedAiData.mainIssue} ${combinedDesc}`,
    city: input.problemLocation.city,
    district: input.problemLocation.district,
    state: input.problemLocation.state,
    address: input.problemLocation.address,
  });

  // If authority match has a specific clarification prompt, append it to questions
  if (authorityMatch.clarificationPrompt && !parsedAiData.clarificationQuestions?.includes(authorityMatch.clarificationPrompt)) {
    parsedAiData.clarificationQuestions = [
      authorityMatch.clarificationPrompt,
      ...(parsedAiData.clarificationQuestions || []),
    ].slice(0, 3);
  }

  // --- STAGE 5: Formal Letter Generation ---
  onStageChange?.('preparing');

  let formalLetter = '';
  const tone = input.preferredTone || 'Formal';
  const language = input.preferredLanguage || 'English';

  if (apiKey) {
    try {
      const letterPrompt = `
You are an expert civic advocate and legal correspondence specialist.
Generate a dignified, highly professional formal complaint letter to the designated public authority.

=== CITIZEN DETAILS ===
Sender Name: ${input.senderDetails?.name || 'A Concerned Citizen / Resident'}
Phone: ${input.senderDetails?.phone || 'Not Disclosed'}
Email: ${input.senderDetails?.email || 'Not Disclosed'}
Correspondence Address: ${input.senderDetails?.residentialAddress || 'Local Resident'}
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

=== RECIPIENT AUTHORITY ===
Authority: ${authorityMatch.primaryAuthority.name}
Jurisdiction: ${authorityMatch.primaryAuthority.jurisdiction}
Official Grievance Portal: ${authorityMatch.primaryAuthority.grievancePortal}

=== PROBLEM EVIDENCE & FACTS ===
Issue: ${parsedAiData.mainIssue}
Category: ${parsedAiData.category}
Exact Location: ${input.problemLocation.address}
Severity: ${parsedAiData.severity} (${parsedAiData.severityExplanation})
Citizen-Provided Facts: ${parsedAiData.userProvidedFacts?.join('; ') || combinedDesc}
Observed Visual Evidence: ${parsedAiData.observedEvidence?.join('; ') || 'Photographic evidence attached'}
Public Impact: ${parsedAiData.publicImpact || 'Hazard to commuters and local residents'}

=== RULES ===
1. Professional, respectful, grammatically flawless tone (${tone}).
2. Include formal standard layout:
   - SENDER DETAILS
   - DATE
   - TO: Designation & Department
   - SUBJECT: Bold, concise subject line.
   - SALUTATION
   - BODY PARAGRAPHS (Clear statement of problem, specific location, visible evidence, public hardship, statutory duty).
   - CALL TO ACTION: Polite request for prompt site inspection and rectification.
   - FORMAL CLOSING & SIGN-OFF
3. Never include invented facts, false accusations, or unsupported legal claims.
4. If target language is not English, translate the ENTIRE letter to: ${language}.
5. Do NOT include markdown code fences (\`\`\`). Output plain formatted text.
`.trim();

      const letterResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: letterPrompt }] }] }),
        }
      );

      if (letterResponse.ok) {
        const letterData = await letterResponse.json();
        const text = letterData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          formalLetter = text.replace(/^```[a-zA-Z]*\n?/g, '').replace(/\n?```$/g, '').trim();
        }
      }
    } catch (err) {
      console.warn('Gemini letter generation error:', err);
    }
  }

  // Deterministic local letter generator if API key absent or network failed
  if (!formalLetter) {
    formalLetter = buildDeterministicFormalLetter({
      input,
      parsedAiData,
      authority: authorityMatch.primaryAuthority,
      tone,
    });
  }

  const letterSubject = `Urgent Grievance: ${parsedAiData.mainIssue} at ${input.problemLocation.city || input.problemLocation.address || 'Local Ward'}`;

  return {
    normalizedDescription: combinedDesc,
    userProvidedFacts: parsedAiData.userProvidedFacts || [combinedDesc],
    observedEvidence: parsedAiData.observedEvidence || ['Photographic record submitted by citizen.'],
    aiInterpretation: parsedAiData.aiInterpretation || 'Civic infrastructure defect requiring timely departmental intervention.',
    mainIssue: parsedAiData.mainIssue || 'Civic Infrastructure Defect',
    category: parsedAiData.category || 'General',
    severity: parsedAiData.severity || 'Moderate',
    severityExplanation: parsedAiData.severityExplanation || 'Standard municipal redressal required to prevent escalation.',
    publicImpact: parsedAiData.publicImpact || 'Affects local pedestrian and vehicular transit.',
    missingInfo: parsedAiData.missingInfo || [],
    clarificationQuestions: parsedAiData.clarificationQuestions || [],
    authorityMatch,
    formalLetter,
    letterSubject,
  };
}

function generateLocalHeuristicUnderstanding(desc: string, photoCount: number) {
  const lower = desc.toLowerCase();
  let category = 'General';
  let mainIssue = 'Civic Infrastructure Issue';
  let severity: 'Routine' | 'Moderate' | 'High' | 'Urgent' = 'Moderate';
  let severityExplanation = 'Identified civic grievance requiring municipal action.';

  if (lower.includes('pothole') || lower.includes('road') || lower.includes('traffic') || lower.includes('highway')) {
    category = 'Roads & Transportation';
    mainIssue = lower.includes('pothole') ? 'Road Surface Damage / Pothole' : 'Road Infrastructure Defect';
    severity = lower.includes('deep') || lower.includes('accident') ? 'High' : 'Moderate';
    severityExplanation = 'Poses direct hazard to vehicular traffic and two-wheeler balance.';
  } else if (lower.includes('garbage') || lower.includes('trash') || lower.includes('waste') || lower.includes('dump')) {
    category = 'Waste Management';
    mainIssue = 'Uncollected Domestic / Commercial Waste';
    severity = lower.includes('overflow') || lower.includes('smell') ? 'High' : 'Moderate';
    severityExplanation = 'Presents environmental contamination and vector-borne public health risk.';
  } else if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe') || lower.includes('sewage')) {
    category = 'Water Supply & Sewage';
    mainIssue = lower.includes('sewage') ? 'Sewage Overflow / Contamination' : 'Drinking Water Pipeline Leakage';
    severity = lower.includes('sewage') ? 'High' : 'Moderate';
    severityExplanation = 'Loss of potable water and sanitation contamination in the vicinity.';
  } else if (lower.includes('light') || lower.includes('dark') || lower.includes('bulb')) {
    category = 'Street Lighting';
    mainIssue = 'Non-Functional Public Street Lighting';
    severity = 'Moderate';
    severityExplanation = 'Affects nighttime visibility and pedestrian safety in the neighborhood.';
  }

  return {
    mainIssue,
    category,
    userProvidedFacts: [desc],
    observedEvidence: photoCount > 0 ? [`${photoCount} submitted photographic image(s) illustrating the civic defect.`] : ['No photographic evidence attached.'],
    aiInterpretation: 'Civic defect requiring prompt scheduled repair by the responsible departmental works team.',
    severity,
    severityExplanation,
    publicImpact: 'Inconvenience and safety risks to residents and regular commuters.',
    missingInfo: ['Exact nearest landmark', 'Specific problem duration'],
    clarificationQuestions: ['Could you provide the nearest prominent landmark or building number?'],
  };
}

function buildDeterministicFormalLetter(params: {
  input: UserComplaintInput;
  parsedAiData: any;
  authority: AuthorityRecord;
  tone: string;
}): string {
  const { input, parsedAiData, authority, tone } = params;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const senderName = input.senderDetails?.name || 'Concerned Citizen';
  const senderContact = [
    input.senderDetails?.phone ? `Phone: ${input.senderDetails.phone}` : '',
    input.senderDetails?.email ? `Email: ${input.senderDetails.email}` : '',
    input.senderDetails?.residentialAddress ? `Address: ${input.senderDetails.residentialAddress}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return `From:
${senderName}
${senderContact || 'Local Resident / Commuter'}

Date: ${today}

To:
The Competent Officer / Grievance Redressal Cell
${authority.name}
${authority.jurisdiction}
Official Grievance Portal: ${authority.grievancePortal}

SUBJECT: Formal Representation regarding ${parsedAiData.mainIssue} at ${input.problemLocation.address || 'Local Ward'}

Respected Sir / Madam,

I am writing to formally bring to your urgent attention a civic grievance concerning ${parsedAiData.mainIssue.toLowerCase()} at the following location:
Location Details: ${input.problemLocation.address}

PROBLEM DETAILS:
${parsedAiData.userProvidedFacts?.join('\n') || input.textDescription || 'Civic infrastructure defect observed at the above-mentioned premises.'}

EVIDENCE & PUBLIC IMPACT:
${parsedAiData.observedEvidence?.join('; ') || 'Supporting photographic evidence has been recorded.'}
This condition has caused substantial public hardship (${parsedAiData.publicImpact || 'adversely impacting pedestrian and vehicular transit'}). The current severity is evaluated as ${parsedAiData.severity}, requiring timely intervention before further deterioration occurs.

In accordance with statutory citizen service standards under your jurisdiction (${authority.responsibility}), I respectfully request your office to conduct a prompt site inspection and order the necessary rectification works at the earliest.

Thanking you.

Yours faithfully,

${senderName}
${input.senderDetails?.phone || ''}
${input.senderDetails?.email || ''}
`.trim();
}

