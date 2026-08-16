import fs from 'fs';
import path from 'path';
import { SEED_QUESTIONS } from '../data/questions.seed';
import {
  AnswerRecord,
  CoupleHistory,
  HistoryEntry,
  Question,
  ScoreResult,
  Session
} from '../types';

interface DatabaseSchema {
  questions: Question[];
  couples: Array<{ id: string; created_at: string }>;
  sessions: Session[];
  answers: AnswerRecord[];
  scores: ScoreResult[];
}

const dbFilePath = path.resolve(__dirname, '../../heartalign.db.json');

function loadDB(): DatabaseSchema {
  if (!fs.existsSync(dbFilePath)) {
    const initialData: DatabaseSchema = {
      questions: SEED_QUESTIONS,
      couples: [],
      sessions: [],
      answers: [],
      scores: []
    };
    saveDB(initialData);
    return initialData;
  }

  try {
    const raw = fs.readFileSync(dbFilePath, 'utf-8');
    const data = JSON.parse(raw) as DatabaseSchema;
    
    // Ensure questions are seeded if missing
    if (!data.questions || data.questions.length === 0) {
      data.questions = SEED_QUESTIONS;
      saveDB(data);
    }
    return data;
  } catch (err) {
    console.error('[DB] Error loading db file, re-initializing:', err);
    const initialData: DatabaseSchema = {
      questions: SEED_QUESTIONS,
      couples: [],
      sessions: [],
      answers: [],
      scores: []
    };
    saveDB(initialData);
    return initialData;
  }
}

function saveDB(data: DatabaseSchema): void {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function initDatabase() {
  loadDB();
  console.log('[Database] Heartalign JSON storage engine initialized successfully.');
}

// ==========================================
// Question Operations
// ==========================================
export function dbGetQuestions(): Question[] {
  const data = loadDB();
  return data.questions;
}

export function dbGetQuestionById(id: string): Question | undefined {
  const data = loadDB();
  return data.questions.find((q) => q.id === id);
}

// ==========================================
// Couple Operations
// ==========================================
export function dbCreateCouple(coupleId: string): void {
  const data = loadDB();
  if (!data.couples.some((c) => c.id === coupleId)) {
    data.couples.push({
      id: coupleId,
      created_at: new Date().toISOString()
    });
    saveDB(data);
  }
}

// ==========================================
// Session Operations
// ==========================================
export function dbCreateSession(session: Session): Session {
  const data = loadDB();
  data.sessions.push(session);
  saveDB(data);
  return session;
}

export function dbGetSessionById(id: string): Session | undefined {
  const data = loadDB();
  return data.sessions.find((s) => s.id === id);
}

export function dbGetSessionByCode(code: string): Session | undefined {
  const data = loadDB();
  const cleanCode = code.trim().toUpperCase();
  return data.sessions.find((s) => s.invite_code.toUpperCase() === cleanCode);
}

export function dbUpdateSession(session: Session): void {
  const data = loadDB();
  const index = data.sessions.findIndex((s) => s.id === session.id);
  if (index !== -1) {
    data.sessions[index] = session;
    saveDB(data);
  }
}

// ==========================================
// Answer Operations
// ==========================================
export function dbSaveAnswers(
  session_id: string,
  partner_id: string,
  answers: Record<string, string | number>
): void {
  const data = loadDB();
  const now = new Date().toISOString();

  // Remove previous answers by this partner for this session to avoid duplicates
  data.answers = data.answers.filter(
    (a) => !(a.session_id === session_id && a.partner_id === partner_id)
  );

  for (const [qId, val] of Object.entries(answers)) {
    data.answers.push({
      id: `ans_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      session_id,
      partner_id,
      question_id: qId,
      answer_value: val,
      submitted_at: now
    });
  }

  saveDB(data);
}

export function dbGetSessionAnswers(session_id: string): AnswerRecord[] {
  const data = loadDB();
  return data.answers.filter((a) => a.session_id === session_id);
}

export function dbGetPartnerAnswers(
  session_id: string,
  partner_id: string
): Record<string, string | number> {
  const data = loadDB();
  const records = data.answers.filter(
    (a) => a.session_id === session_id && a.partner_id === partner_id
  );

  const resultMap: Record<string, string | number> = {};
  for (const r of records) {
    resultMap[r.question_id] = r.answer_value;
  }
  return resultMap;
}

// ==========================================
// Score Operations
// ==========================================
export function dbSaveScore(scoreResult: ScoreResult): void {
  const data = loadDB();
  const idx = data.scores.findIndex((s) => s.session_id === scoreResult.session_id);
  if (idx !== -1) {
    data.scores[idx] = scoreResult;
  } else {
    data.scores.push(scoreResult);
  }
  saveDB(data);
}

export function dbGetScoreBySessionId(session_id: string): ScoreResult | undefined {
  const data = loadDB();
  return data.scores.find((s) => s.session_id === session_id);
}

export function dbGetCoupleHistory(couple_id: string): CoupleHistory {
  const data = loadDB();
  const scores = data.scores
    .filter((s) => s.couple_id === couple_id)
    .sort((a, b) => new Date(a.calculated_at).getTime() - new Date(b.calculated_at).getTime());

  const historyEntries: HistoryEntry[] = scores.map((s) => {
    const categoryScores: Record<string, number> = {};
    for (const [catName, catDetail] of Object.entries(s.category_breakdown)) {
      categoryScores[catName] = catDetail.score;
    }

    return {
      session_id: s.session_id,
      date: s.calculated_at,
      partner1_name: s.partner1_name,
      partner2_name: s.partner2_name,
      overall_score: s.overall_score,
      category_scores: categoryScores as any
    };
  });

  return {
    couple_id,
    total_quizzes: historyEntries.length,
    history: historyEntries
  };
}
