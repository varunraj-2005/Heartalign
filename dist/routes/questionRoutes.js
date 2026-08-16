"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../db/database");
const router = (0, express_1.Router)();
// GET /api/questions - Fetch all relationship questions
router.get('/', (req, res) => {
    try {
        const questions = (0, database_1.dbGetQuestions)();
        res.json({
            success: true,
            count: questions.length,
            questions
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// GET /api/questions/:id - Fetch single question
router.get('/:id', (req, res) => {
    try {
        const question = (0, database_1.dbGetQuestionById)(req.params.id);
        if (!question) {
            res.status(404).json({ success: false, error: 'Question not found' });
            return;
        }
        res.json({ success: true, question });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
