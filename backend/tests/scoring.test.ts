import { calculateQuestionScore, computeCompatibilityScore } from '../src/services/scoringEngine';
import { Question } from '../src/types';
import { SEED_QUESTIONS } from '../src/data/questions.seed';

console.log('=== RUNNING HEARTALIGN SCORING ENGINE UNIT TESTS ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

// -------------------------------------------------------------
// Test 1: Scale 1-to-5 closeness scoring (not flat exact match)
// -------------------------------------------------------------
const scaleQuestion: Question = {
  id: 'test_scale',
  category: 'Values & Life Goals',
  question_type: 'scale_1_to_5',
  prompt: 'Test Scale'
};

const res5v5 = calculateQuestionScore(scaleQuestion, 5, 5);
assert(res5v5.score === 100, 'Scale 5 vs 5 should score 100%');

const res4v5 = calculateQuestionScore(scaleQuestion, 4, 5);
assert(res4v5.score === 75, 'Scale 4 vs 5 should score 75% (closeness, not exact match)');

const res3v5 = calculateQuestionScore(scaleQuestion, 3, 5);
assert(res3v5.score === 50, 'Scale 3 vs 5 should score 50%');

const res1v5 = calculateQuestionScore(scaleQuestion, 1, 5);
assert(res1v5.score === 0, 'Scale 1 vs 5 should score 0%');


// -------------------------------------------------------------
// Test 2: Multiple choice matrix & exact match
// -------------------------------------------------------------
const mcQuestion: Question = {
  id: 'test_mc',
  category: 'Values & Life Goals',
  question_type: 'multiple_choice_match',
  prompt: 'Test MC',
  scoring_rules: {
    exact_match_score: 100,
    partial_matrix: {
      city: { suburbs: 65, rural: 30 },
      suburbs: { city: 65, rural: 70 }
    }
  }
};

const mcExact = calculateQuestionScore(mcQuestion, 'city', 'city');
assert(mcExact.score === 100, 'Multiple choice exact match should score 100%');

const mcPartial = calculateQuestionScore(mcQuestion, 'city', 'suburbs');
assert(mcPartial.score === 65, 'Multiple choice partial match city vs suburbs should score 65%');


// -------------------------------------------------------------
// Test 3: Conflict Style Complementary Flagging
// -------------------------------------------------------------
const conflictQ = SEED_QUESTIONS.find(q => q.id === 'cnf_1')!;
const conflictRes = calculateQuestionScore(conflictQ, 'cool_off', 'resolve_now');
assert(conflictRes.conflictFlag !== undefined, 'Conflict style difference (cool_off vs resolve_now) should trigger a conflict flag');
assert(conflictRes.conflictFlag?.flag_name === 'Space Seeker vs. Immediate Processor', 'Conflict flag name should be "Space Seeker vs. Immediate Processor"');


// -------------------------------------------------------------
// Test 4: Open Ended Reflection Exclusion
// -------------------------------------------------------------
const refQ: Question = {
  id: 'test_ref',
  category: 'Conflict Style',
  question_type: 'open_ended_reflection',
  prompt: 'Test Reflection'
};

const refRes = calculateQuestionScore(refQ, 'p1 answer text', 'p2 answer text');
assert(refRes.score === null, 'Open ended reflection should be excluded from numerical scoring (score === null)');


// -------------------------------------------------------------
// Test 5: Full Compatibility Computation & Category Weighting
// -------------------------------------------------------------
const mockP1Answers: Record<string, string | number> = {
  val_1: 'city',
  val_2: 4,
  val_3: 3,
  val_4: 'want_kids',
  tru_1: 4,
  tru_2: 3,
  tru_3: 'take_pause',
  tru_4: 3,
  cnf_1: 'cool_off',
  cnf_2: 4,
  cnf_3: 'words_acknowledgment',
  cnf_4: 'I need to know you still love me even when mad.',
  int_1: 'touch',
  int_2: 4,
  int_3: 3,
  int_4: 'Bring me boba and sit on the porch together.',
  hab_1: 'spontaneous_help',
  hab_2: 3,
  hab_3: 'flexible_sleeper',
  fun_1: 'pizza_movie',
  fun_2: 'tropical_beach',
  fun_3: 'cooking_baking'
};

const mockP2Answers: Record<string, string | number> = {
  val_1: 'city',
  val_2: 4,
  val_3: 3,
  val_4: 'want_kids',
  tru_1: 4,
  tru_2: 3,
  tru_3: 'take_pause',
  tru_4: 3,
  cnf_1: 'resolve_now', // triggers complementary flag!
  cnf_2: 4,
  cnf_3: 'words_acknowledgment',
  cnf_4: 'Take a deep breath and tell me we are a team.',
  int_1: 'touch',
  int_2: 4,
  int_3: 3,
  int_4: 'Cook dinner together with favorite music playing.',
  hab_1: 'spontaneous_help',
  hab_2: 3,
  hab_3: 'flexible_sleeper',
  fun_1: 'pizza_movie',
  fun_2: 'tropical_beach',
  fun_3: 'cooking_baking'
};

const fullResult = computeCompatibilityScore(
  SEED_QUESTIONS,
  mockP1Answers,
  mockP2Answers,
  'ses_123',
  'cpl_456',
  'Alex',
  'Jordan'
);

assert(fullResult.overall_score > 80, 'Overall score for near-identical answers should be > 80');
assert(fullResult.conflict_flags.length > 0, 'Full test should detect at least 1 complementary conflict flag');
assert(fullResult.reflections.length === 2, 'Full test should capture both open-ended reflection answers side-by-side');
assert(fullResult.disclaimer.includes('reflection, self-discovery, and fun'), 'Result includes required disclaimer notice');

console.log(`\n=== TEST RESULTS: ${passedTests}/${totalTests} PASSED ===`);
