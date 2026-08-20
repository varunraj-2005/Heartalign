export type Category = 
  | 'Values & Life Goals'
  | 'Trust & Communication'
  | 'Conflict Style'
  | 'Intimacy & Affection'
  | 'Daily Life & Habits'
  | 'Fun/Trivia';

export const CATEGORY_WEIGHTS: Record<Category, number> = {
  'Values & Life Goals': 0.25,
  'Trust & Communication': 0.25,
  'Conflict Style': 0.15,
  'Intimacy & Affection': 0.15,
  'Daily Life & Habits': 0.10,
  'Fun/Trivia': 0.10,
};

export type QuestionType = 'scale_1_to_5' | 'multiple_choice_match' | 'open_ended_reflection';

export interface Option {
  value: string | number;
  label: string;
  description?: string;
}

export interface PartialMatchMatrix {
  [val1: string]: {
    [val2: string]: number; // score from 0 to 100
  };
}

export interface ComplementaryConflictPair {
  val1: string | number;
  val2: string | number;
  flag_name: string;
  description: string;
}

export interface QuestionScoringRules {
  exact_match_score?: number;
  partial_matrix?: PartialMatchMatrix;
  complementary_conflict_pairs?: ComplementaryConflictPair[];
}

export interface Question {
  id: string;
  category: Category;
  question_type: QuestionType;
  prompt: string;
  subtitle?: string;
  options?: Option[];
  scoring_rules?: QuestionScoringRules;
}

export interface Session {
  id: string;
  invite_code: string;
  couple_id: string;
  partner1_id: string;
  partner1_name: string;
  partner2_id?: string | null;
  partner2_name?: string | null;
  status: 'waiting_for_partner2' | 'in_progress' | 'completed';
  created_at: string;
  completed_at?: string | null;
}

export interface AnswerInput {
  partner_id: string;
  answers: Record<string, string | number>; // question_id -> answer value
}

export interface AnswerRecord {
  id: string;
  session_id: string;
  partner_id: string;
  question_id: string;
  answer_value: string | number;
  submitted_at: string;
}

export interface CategoryScoreDetail {
  category: Category;
  weight: number;
  score: number; // 0 to 100
  insight: string;
  questions_count: number;
}

export interface ConflictFlag {
  question_id: string;
  question_prompt: string;
  partner1_answer_label: string;
  partner2_answer_label: string;
  flag_name: string;
  note: string;
}

export interface SideBySideReflection {
  question_id: string;
  question_prompt: string;
  partner1_answer: string | number;
  partner2_answer: string | number;
}

export interface ScoreResult {
  session_id: string;
  couple_id: string;
  partner1_name: string;
  partner2_name: string;
  overall_score: number;
  category_breakdown: Record<Category, CategoryScoreDetail>;
  conflict_flags: ConflictFlag[];
  reflections: SideBySideReflection[];
  disclaimer: string;
  calculated_at: string;
  ai_analysis?: string;
}

export interface HistoryEntry {
  session_id: string;
  date: string;
  partner1_name: string;
  partner2_name: string;
  overall_score: number;
  category_scores: Record<Category, number>;
}

export interface CoupleHistory {
  couple_id: string;
  total_quizzes: number;
  history: HistoryEntry[];
}
