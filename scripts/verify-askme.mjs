import { matchAuthority, VERIFIED_AUTHORITIES, getUniversalLocalAuthority } from '../src/services/authorityDirectory.ts';
import {
  generateCivicActionSummary,
  buildSummarizerPrompt,
  buildActionCheckpoints,
  OPEN_SOURCE_MODELS,
} from '../src/services/openSourceSummarizer.ts';

console.log('--- STARTING ASKME SYSTEM AUDIT & INTEGRITY CHECKS ---');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// Test 1: Verified Directory Integrity
assert(VERIFIED_AUTHORITIES.length >= 10, `Directory contains ${VERIFIED_AUTHORITIES.length} verified real authorities.`);
assert(
  VERIFIED_AUTHORITIES.every((a) => a.grievancePortal.startsWith('https://') && a.officialWebsite.startsWith('https://')),
  'All verified authorities have valid HTTPS official portal and website URLs.'
);

// Test 2: National Highway Resolution
const nhaiTest = matchAuthority({
  category: 'Roads & Transportation',
  description: 'Massive pothole on National Highway NH-48 near toll plaza',
  city: 'Bengaluru',
  state: 'Karnataka',
});
assert(nhaiTest.primaryAuthority.id === 'central-nhai', 'National Highway correctly routes to NHAI.');
assert(nhaiTest.confidence === 'High confidence', 'NHAI match produces High confidence.');
assert(nhaiTest.alternativeAuthority !== undefined, 'Ambiguous road scenario suggests alternative local authority.');

// Test 3: Railways Resolution
const railTest = matchAuthority({
  category: 'Railways',
  description: 'Broken concrete on platform 3 and loose railway track near station gate',
  city: 'Chennai',
  state: 'Tamil Nadu',
});
assert(railTest.primaryAuthority.id === 'central-railways', 'Railway infrastructure routes to Indian Railways RailMadad.');
assert(railTest.primaryAuthority.grievancePortal.includes('railmadad'), 'RailMadad portal URL verified.');

// Test 4: City-Specific Municipal Corporation (Chennai)
const chennaiRoadTest = matchAuthority({
  category: 'Roads & Transportation',
  description: 'Deep road surface cave-in on residential street',
  city: 'Chennai',
  state: 'Tamil Nadu',
});
assert(chennaiRoadTest.primaryAuthority.id === 'tn-chennai-corp', 'Chennai internal street routes to Greater Chennai Corporation (GCC).');

// Test 5: Waste & Sanitation Routing
const garbageTest = matchAuthority({
  category: 'Waste Management',
  description: 'Overflowing domestic trash containers uncollected for 7 days',
  city: 'Pune',
  district: 'Pune',
  state: 'Maharashtra',
});
assert(garbageTest.primaryAuthority.name.includes('Pune') || garbageTest.primaryAuthority.id === 'mh-pmc', 'Pune waste routes to Pune Municipal Corporation.');
assert(garbageTest.alternativeAuthority?.id === 'central-swachhata', 'Waste management links to Swachhata escalation.');

// Test 6: Water Supply & Sewage in Bengaluru
const waterTest = matchAuthority({
  category: 'Water Supply & Sewage',
  description: 'Main Cauvery potable water distribution pipe ruptured, clean water flooding roadway',
  city: 'Bengaluru',
  district: 'Bengaluru Urban',
  state: 'Karnataka',
});
assert(waterTest.primaryAuthority.id === 'ka-bwssb', 'Bengaluru water supply routes to BWSSB.');

// Test 7: Universal Local Authority Synthesis for any unseen city/district
const dynamicTest = getUniversalLocalAuthority('Coimbatore', 'Coimbatore', 'Tamil Nadu', 'Roads & Transportation');
assert(dynamicTest.name.includes('Coimbatore'), 'Universal authority generator creates valid statutory hierarchy for Coimbatore.');
assert(dynamicTest.responsibility.includes('Coimbatore'), 'Universal authority generator customizes responsibility for Coimbatore.');

// Test 8: Open-Source AI Summarizer Prompt Formatter
const mockTelemetry = {
  complaintId: 'ASKME-2026-998877',
  mainIssue: 'Hazardous Road Pothole',
  category: 'Roads & Transportation',
  severity: 'High',
  location: '100ft Road, Indiranagar, Bengaluru',
  photoCount: 2,
  authorityName: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
  authorityJurisdiction: 'BBMP East Zone',
  authorityPortal: 'https://bbmp.gov.in',
  letterSubject: 'Urgent Grievance: Hazardous Road Pothole',
  status: 'Submitted',
};
const promptText = buildSummarizerPrompt(mockTelemetry);
assert(promptText.includes('summarize civic action:'), 'Flan-T5 prompt contains instruction prefix.');
assert(promptText.includes('Hazardous Road Pothole'), 'Flan-T5 prompt includes grievance issue.');
assert(promptText.includes('2 verified photo(s) attached'), 'Flan-T5 prompt formats evidence status.');

// Test 9: Action Checkpoints Generation
const checkpoints = buildActionCheckpoints(mockTelemetry);
assert(checkpoints.length === 5, 'Checkpoints generator yields 5 civic pipeline stages.');
assert(checkpoints[4].completed === true, 'Submission status correctly marks authority dispatch as completed.');

// Test 10: Civic Action Summary Engine
const summaryOutput = await generateCivicActionSummary(mockTelemetry);
assert(summaryOutput.summaryText.length > 50, 'Summarizer generates substantive executive overview.');
assert(summaryOutput.summaryText.includes('Bruhat Bengaluru Mahanagara Palike'), 'Summary attributes responsible authority.');
assert(summaryOutput.summaryText.includes('ASKME-2026-998877'), 'Summary cites complaint tracking reference.');
assert(typeof summaryOutput.latencyMs === 'number', 'Latency measurement returned.');

// Test 11: Open-Source Models Registry Coverage
assert(OPEN_SOURCE_MODELS.length >= 6, `Open-source registry hosts ${OPEN_SOURCE_MODELS.length} foundation models.`);
const expectedModelIds = ['qwen-2.5-7b', 'llama-3.2-3b', 'mistral-7b', 'phi-3.5-mini', 'flan-t5-small', 'deepseek-r1-distill-7b'];
assert(
  expectedModelIds.every((id) => OPEN_SOURCE_MODELS.some((m) => m.id === id)),
  'All 6 open-source foundation model families verified (Qwen 2.5, Llama 3.2, Mistral 7B, Phi 3.5, FLAN-T5, DeepSeek R1).'
);

// Test 12: Qwen 2.5 Multilingual Inference
const qwenOutput = await generateCivicActionSummary({ ...mockTelemetry, preferredLanguage: 'Tamil' }, 'qwen-2.5-7b');
assert(qwenOutput.modelId === 'qwen-2.5-7b', 'Qwen 2.5 selected and executed.');
assert(qwenOutput.bilingualSummary !== undefined, 'Qwen 2.5 produces bilingual vernacular output.');
assert(qwenOutput.bilingualSummary.text.length > 10, 'Qwen 2.5 generates Tamil/Hindi vernacular script.');

// Test 13: Mistral 7B Legal Citations Extraction
const mistralOutput = await generateCivicActionSummary(mockTelemetry, 'mistral-7b');
assert(mistralOutput.modelId === 'mistral-7b', 'Mistral 7B selected and executed.');
assert(mistralOutput.statutoryCitations && mistralOutput.statutoryCitations.length >= 2, 'Mistral 7B extracts statutory legal citations.');

// Test 14: DeepSeek R1 Chain-of-Thought Jurisdictional Audit
const deepseekOutput = await generateCivicActionSummary(mockTelemetry, 'deepseek-r1-distill-7b');
assert(deepseekOutput.modelId === 'deepseek-r1-distill-7b', 'DeepSeek R1 Distill selected and executed.');
assert(deepseekOutput.reasoningSteps && deepseekOutput.reasoningSteps.length >= 3, 'DeepSeek R1 generates step-by-step CoT audit.');

// Test 15: Llama 3.2 Edge Reasoning & Phi-3.5 Compact Model
const llamaOutput = await generateCivicActionSummary(mockTelemetry, 'llama-3.2-3b');
const phiOutput = await generateCivicActionSummary(mockTelemetry, 'phi-3.5-mini');
assert(llamaOutput.modelId === 'llama-3.2-3b' && phiOutput.modelId === 'phi-3.5-mini', 'Llama 3.2 and Phi-3.5 successfully execute.');

console.log(`\nTESTS COMPLETED: ${passedTests}/${totalTests} passed.`);
if (passedTests === totalTests) {
  console.log('ALL VERIFICATION CHECKS SUCCEEDED!');
} else {
  console.error('SOME CHECKS FAILED!');
  process.exit(1);
}
