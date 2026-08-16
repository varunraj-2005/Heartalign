import { Router, Request, Response } from 'express';
import { dbGetQuestions, dbGetQuestionById } from '../db/database';

const router = Router();

// GET /api/questions - Fetch all relationship questions
router.get('/', (req: Request, res: Response) => {
  try {
    const questions = dbGetQuestions();
    res.json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/questions/:id - Fetch single question
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const question = dbGetQuestionById(id);
    if (!question) {
      res.status(404).json({ success: false, error: 'Question not found' });
      return;
    }
    res.json({ success: true, question });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
