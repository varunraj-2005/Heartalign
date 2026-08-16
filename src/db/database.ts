import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { SEED_QUESTIONS } from '../data/questions.seed';

const dbPath = path.resolve(__dirname, '../../heartalign.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      question_type TEXT NOT NULL,
      prompt TEXT NOT NULL,
      subtitle TEXT,
      options TEXT,
      scoring_rules TEXT
    );

    CREATE TABLE IF NOT EXISTS couples (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      invite_code TEXT UNIQUE NOT NULL,
      couple_id TEXT NOT NULL,
      partner1_id TEXT NOT NULL,
      partner1_name TEXT NOT NULL,
      partner2_id TEXT,
      partner2_name TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      FOREIGN KEY (couple_id) REFERENCES couples(id)
    );

    CREATE TABLE IF NOT EXISTS answers (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      partner_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      answer_value TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );

    CREATE TABLE IF NOT EXISTS scores (
      id TEXT PRIMARY KEY,
      session_id TEXT UNIQUE NOT NULL,
      couple_id TEXT NOT NULL,
      overall_score REAL NOT NULL,
      category_breakdown TEXT NOT NULL,
      conflict_flags TEXT NOT NULL,
      reflections TEXT NOT NULL,
      calculated_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id),
      FOREIGN KEY (couple_id) REFERENCES couples(id)
    );
  `);

  // Seed questions if empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number };
  if (countRow.count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO questions (id, category, question_type, prompt, subtitle, options, scoring_rules)
      VALUES (@id, @category, @question_type, @prompt, @subtitle, @options, @scoring_rules)
    `);

    const insertMany = db.transaction((questions) => {
      for (const q of questions) {
        insertStmt.run({
          id: q.id,
          category: q.category,
          question_type: q.question_type,
          prompt: q.prompt,
          subtitle: q.subtitle || null,
          options: q.options ? JSON.stringify(q.options) : null,
          scoring_rules: q.scoring_rules ? JSON.stringify(q.scoring_rules) : null,
        });
      }
    });

    insertMany(SEED_QUESTIONS);
    console.log(`[Database] Successfully seeded ${SEED_QUESTIONS.length} relationship questions.`);
  }
}

export default db;
