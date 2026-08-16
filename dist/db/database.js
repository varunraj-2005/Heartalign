"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
exports.dbGetQuestions = dbGetQuestions;
exports.dbGetQuestionById = dbGetQuestionById;
exports.dbCreateCouple = dbCreateCouple;
exports.dbCreateSession = dbCreateSession;
exports.dbGetSessionById = dbGetSessionById;
exports.dbGetSessionByCode = dbGetSessionByCode;
exports.dbUpdateSession = dbUpdateSession;
exports.dbSaveAnswers = dbSaveAnswers;
exports.dbGetSessionAnswers = dbGetSessionAnswers;
exports.dbGetPartnerAnswers = dbGetPartnerAnswers;
exports.dbSaveScore = dbSaveScore;
exports.dbGetScoreBySessionId = dbGetScoreBySessionId;
exports.dbGetCoupleHistory = dbGetCoupleHistory;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const questions_seed_1 = require("../data/questions.seed");
const dbFilePath = path_1.default.resolve(__dirname, '../../heartalign.db.json');
function loadDB() {
    if (!fs_1.default.existsSync(dbFilePath)) {
        const initialData = {
            questions: questions_seed_1.SEED_QUESTIONS,
            couples: [],
            sessions: [],
            answers: [],
            scores: []
        };
        saveDB(initialData);
        return initialData;
    }
    try {
        const raw = fs_1.default.readFileSync(dbFilePath, 'utf-8');
        const data = JSON.parse(raw);
        // Ensure questions are seeded if missing
        if (!data.questions || data.questions.length === 0) {
            data.questions = questions_seed_1.SEED_QUESTIONS;
            saveDB(data);
        }
        return data;
    }
    catch (err) {
        console.error('[DB] Error loading db file, re-initializing:', err);
        const initialData = {
            questions: questions_seed_1.SEED_QUESTIONS,
            couples: [],
            sessions: [],
            answers: [],
            scores: []
        };
        saveDB(initialData);
        return initialData;
    }
}
function saveDB(data) {
    fs_1.default.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
}
function initDatabase() {
    loadDB();
    console.log('[Database] Heartalign JSON storage engine initialized successfully.');
}
// ==========================================
// Question Operations
// ==========================================
function dbGetQuestions() {
    const data = loadDB();
    return data.questions;
}
function dbGetQuestionById(id) {
    const data = loadDB();
    return data.questions.find((q) => q.id === id);
}
// ==========================================
// Couple Operations
// ==========================================
function dbCreateCouple(coupleId) {
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
function dbCreateSession(session) {
    const data = loadDB();
    data.sessions.push(session);
    saveDB(data);
    return session;
}
function dbGetSessionById(id) {
    const data = loadDB();
    return data.sessions.find((s) => s.id === id);
}
function dbGetSessionByCode(code) {
    const data = loadDB();
    const cleanCode = code.trim().toUpperCase();
    return data.sessions.find((s) => s.invite_code.toUpperCase() === cleanCode);
}
function dbUpdateSession(session) {
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
function dbSaveAnswers(session_id, partner_id, answers) {
    const data = loadDB();
    const now = new Date().toISOString();
    // Remove previous answers by this partner for this session to avoid duplicates
    data.answers = data.answers.filter((a) => !(a.session_id === session_id && a.partner_id === partner_id));
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
function dbGetSessionAnswers(session_id) {
    const data = loadDB();
    return data.answers.filter((a) => a.session_id === session_id);
}
function dbGetPartnerAnswers(session_id, partner_id) {
    const data = loadDB();
    const records = data.answers.filter((a) => a.session_id === session_id && a.partner_id === partner_id);
    const resultMap = {};
    for (const r of records) {
        resultMap[r.question_id] = r.answer_value;
    }
    return resultMap;
}
// ==========================================
// Score Operations
// ==========================================
function dbSaveScore(scoreResult) {
    const data = loadDB();
    const idx = data.scores.findIndex((s) => s.session_id === scoreResult.session_id);
    if (idx !== -1) {
        data.scores[idx] = scoreResult;
    }
    else {
        data.scores.push(scoreResult);
    }
    saveDB(data);
}
function dbGetScoreBySessionId(session_id) {
    const data = loadDB();
    return data.scores.find((s) => s.session_id === session_id);
}
function dbGetCoupleHistory(couple_id) {
    const data = loadDB();
    const scores = data.scores
        .filter((s) => s.couple_id === couple_id)
        .sort((a, b) => new Date(a.calculated_at).getTime() - new Date(b.calculated_at).getTime());
    const historyEntries = scores.map((s) => {
        const categoryScores = {};
        for (const [catName, catDetail] of Object.entries(s.category_breakdown)) {
            categoryScores[catName] = catDetail.score;
        }
        return {
            session_id: s.session_id,
            date: s.calculated_at,
            partner1_name: s.partner1_name,
            partner2_name: s.partner2_name,
            overall_score: s.overall_score,
            category_scores: categoryScores
        };
    });
    return {
        couple_id,
        total_quizzes: historyEntries.length,
        history: historyEntries
    };
}
