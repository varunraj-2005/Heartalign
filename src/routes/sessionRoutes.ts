import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  dbCreateCouple,
  dbCreateSession,
  dbGetPartnerAnswers,
  dbGetQuestions,
  dbGetScoreBySessionId,
  dbGetSessionAnswers,
  dbGetSessionByCode,
  dbGetSessionById,
  dbGetCoupleHistory,
  dbSaveAnswers,
  dbSaveScore,
  dbUpdateSession
} from '../db/database';
import { computeCompatibilityScore } from '../services/scoringEngine';
import { Session } from '../types';

const router = Router();

// Helper to generate readable 6-char code like HEART-7X92
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `HEART-${rand}`;
}

// POST /api/sessions - Create new session (Partner 1)
router.post('/sessions', (req: Request, res: Response) => {
  try {
    const { partner1_name, couple_id: existing_couple_id } = req.body;

    if (!partner1_name || typeof partner1_name !== 'string' || partner1_name.trim().length === 0) {
      res.status(400).json({ success: false, error: 'partner1_name is required' });
      return;
    }

    const couple_id = existing_couple_id || `cpl_${uuidv4().substring(0, 8)}`;
    dbCreateCouple(couple_id);

    const session_id = `ses_${uuidv4()}`;
    const partner1_id = `ptr_${uuidv4().substring(0, 8)}`;
    const invite_code = generateInviteCode();

    const newSession: Session = {
      id: session_id,
      invite_code,
      couple_id,
      partner1_id,
      partner1_name: partner1_name.trim(),
      partner2_id: null,
      partner2_name: null,
      status: 'waiting_for_partner2',
      created_at: new Date().toISOString()
    };

    dbCreateSession(newSession);

    const protocol = req.protocol;
    const host = req.get('host') || 'localhost:5000';
    const share_url = `${protocol}://${host}/join/${invite_code}`;

    res.status(201).json({
      success: true,
      message: 'Session created successfully. Share the invite code or link with Partner 2!',
      session: {
        session_id: newSession.id,
        invite_code: newSession.invite_code,
        couple_id: newSession.couple_id,
        partner1_id: newSession.partner1_id,
        partner1_name: newSession.partner1_name,
        status: newSession.status,
        created_at: newSession.created_at,
        share_url
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/sessions/code/:code - Lookup session details by invite code
router.get('/sessions/code/:code', (req: Request, res: Response) => {
  try {
    const code = req.params.code;
    const session = dbGetSessionByCode(code);

    if (!session) {
      res.status(404).json({ success: false, error: 'Invalid invite code or session expired' });
      return;
    }

    res.json({
      success: true,
      session: {
        session_id: session.id,
        invite_code: session.invite_code,
        couple_id: session.couple_id,
        partner1_name: session.partner1_name,
        partner2_name: session.partner2_name,
        status: session.status,
        is_full: !!session.partner2_id
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/sessions/join - Partner 2 joins session via invite code
router.post('/sessions/join', (req: Request, res: Response) => {
  try {
    const { invite_code, partner2_name } = req.body;

    if (!invite_code || !partner2_name || typeof partner2_name !== 'string') {
      res.status(400).json({ success: false, error: 'invite_code and partner2_name are required' });
      return;
    }

    const session = dbGetSessionByCode(invite_code);
    if (!session) {
      res.status(404).json({ success: false, error: 'Invalid invite code' });
      return;
    }

    if (session.partner2_id && session.partner2_name) {
      // Already joined, allow re-entry if same name or return existing info
      res.json({
        success: true,
        message: 'Re-entered session',
        session: {
          session_id: session.id,
          invite_code: session.invite_code,
          couple_id: session.couple_id,
          partner2_id: session.partner2_id,
          partner2_name: session.partner2_name,
          partner1_name: session.partner1_name,
          status: session.status
        }
      });
      return;
    }

    const partner2_id = `ptr_${uuidv4().substring(0, 8)}`;
    session.partner2_id = partner2_id;
    session.partner2_name = partner2_name.trim();
    session.status = 'in_progress';

    dbUpdateSession(session);

    res.json({
      success: true,
      message: `Successfully joined session with ${session.partner1_name}!`,
      session: {
        session_id: session.id,
        invite_code: session.invite_code,
        couple_id: session.couple_id,
        partner2_id: session.partner2_id,
        partner2_name: session.partner2_name,
        partner1_name: session.partner1_name,
        status: session.status
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/sessions/:id/status - Check real-time submission status
router.get('/sessions/:id/status', (req: Request, res: Response) => {
  try {
    const session = dbGetSessionById(req.params.id);
    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    const p1Answers = dbGetPartnerAnswers(session.id, session.partner1_id);
    const p1Submitted = Object.keys(p1Answers).length > 0;

    let p2Submitted = false;
    if (session.partner2_id) {
      const p2Answers = dbGetPartnerAnswers(session.id, session.partner2_id);
      p2Submitted = Object.keys(p2Answers).length > 0;
    }

    const bothCompleted = p1Submitted && p2Submitted;

    res.json({
      success: true,
      session_id: session.id,
      status: session.status,
      partner1: {
        id: session.partner1_id,
        name: session.partner1_name,
        has_submitted: p1Submitted
      },
      partner2: session.partner2_id
        ? {
            id: session.partner2_id,
            name: session.partner2_name,
            has_submitted: p2Submitted
          }
        : null,
      both_completed: bothCompleted
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/sessions/:id/answers - Submit answers for a partner
router.post('/sessions/:id/answers', (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const { partner_id, answers } = req.body;

    if (!partner_id || !answers || typeof answers !== 'object') {
      res.status(400).json({ success: false, error: 'partner_id and answers object are required' });
      return;
    }

    const session = dbGetSessionById(sessionId);
    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    if (partner_id !== session.partner1_id && partner_id !== session.partner2_id) {
      res.status(403).json({ success: false, error: 'partner_id does not belong to this session' });
      return;
    }

    dbSaveAnswers(session.id, partner_id, answers);

    // Check if both partners have finished now
    const p1Answers = dbGetPartnerAnswers(session.id, session.partner1_id);
    let p2Answers: Record<string, string | number> = {};
    if (session.partner2_id) {
      p2Answers = dbGetPartnerAnswers(session.id, session.partner2_id);
    }

    const p1Done = Object.keys(p1Answers).length > 0;
    const p2Done = session.partner2_id ? Object.keys(p2Answers).length > 0 : false;
    const bothCompleted = p1Done && p2Done;

    if (bothCompleted) {
      session.status = 'completed';
      session.completed_at = new Date().toISOString();
      dbUpdateSession(session);

      // Compute compatibility score
      const questions = dbGetQuestions();
      const scoreResult = computeCompatibilityScore(
        questions,
        p1Answers,
        p2Answers,
        session.id,
        session.couple_id,
        session.partner1_name,
        session.partner2_name || 'Partner 2'
      );

      dbSaveScore(scoreResult);
    }

    res.json({
      success: true,
      message: 'Answers submitted successfully!',
      session_status: session.status,
      both_completed: bothCompleted
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/sessions/:id/results - Retrieve calculated score results
router.get('/sessions/:id/results', (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const session = dbGetSessionById(sessionId);

    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    let scoreResult = dbGetScoreBySessionId(sessionId);

    if (!scoreResult) {
      // Check if both have answers and calculate on the fly
      const p1Answers = dbGetPartnerAnswers(session.id, session.partner1_id);
      let p2Answers: Record<string, string | number> = {};
      if (session.partner2_id) {
        p2Answers = dbGetPartnerAnswers(session.id, session.partner2_id);
      }

      if (Object.keys(p1Answers).length > 0 && Object.keys(p2Answers).length > 0) {
        const questions = dbGetQuestions();
        scoreResult = computeCompatibilityScore(
          questions,
          p1Answers,
          p2Answers,
          session.id,
          session.couple_id,
          session.partner1_name,
          session.partner2_name || 'Partner 2'
        );
        dbSaveScore(scoreResult);

        session.status = 'completed';
        session.completed_at = new Date().toISOString();
        dbUpdateSession(session);
      } else {
        res.status(202).json({
          success: false,
          error: 'Results not ready. Both partners must submit their answers first.',
          status: session.status,
          partner1_has_submitted: Object.keys(p1Answers).length > 0,
          partner2_has_submitted: Object.keys(p2Answers).length > 0
        });
        return;
      }
    }

    res.json({
      success: true,
      results: scoreResult
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/couples/:coupleId/history - Score trends over time for a couple
router.get('/couples/:coupleId/history', (req: Request, res: Response) => {
  try {
    const coupleId = req.params.coupleId;
    const history = dbGetCoupleHistory(coupleId);
    res.json({
      success: true,
      data: history
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
