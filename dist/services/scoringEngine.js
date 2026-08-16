"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateQuestionScore = calculateQuestionScore;
exports.generateCategoryInsight = generateCategoryInsight;
exports.computeCompatibilityScore = computeCompatibilityScore;
const types_1 = require("../types");
function calculateQuestionScore(question, val1, val2) {
    if (question.question_type === 'open_ended_reflection') {
        return { score: null };
    }
    if (question.question_type === 'scale_1_to_5') {
        const num1 = Number(val1);
        const num2 = Number(val2);
        if (isNaN(num1) || isNaN(num2)) {
            return { score: 50 };
        }
        const diff = Math.abs(num1 - num2);
        // 0 diff -> 100, 1 diff -> 75, 2 diff -> 50, 3 diff -> 25, 4 diff -> 0
        const score = Math.max(0, 100 - diff * 25);
        return { score };
    }
    if (question.question_type === 'multiple_choice_match') {
        const str1 = String(val1);
        const str2 = String(val2);
        let conflictFlag;
        // Check complementary conflict rules if defined
        if (question.scoring_rules?.complementary_conflict_pairs) {
            for (const pair of question.scoring_rules.complementary_conflict_pairs) {
                if ((String(pair.val1) === str1 && String(pair.val2) === str2) ||
                    (String(pair.val1) === str2 && String(pair.val2) === str1)) {
                    const opt1Label = question.options?.find(o => String(o.value) === str1)?.label || str1;
                    const opt2Label = question.options?.find(o => String(o.value) === str2)?.label || str2;
                    conflictFlag = {
                        question_id: question.id,
                        question_prompt: question.prompt,
                        partner1_answer_label: opt1Label,
                        partner2_answer_label: opt2Label,
                        flag_name: pair.flag_name,
                        note: pair.description
                    };
                }
            }
        }
        if (str1 === str2) {
            return { score: question.scoring_rules?.exact_match_score ?? 100, conflictFlag };
        }
        // Check partial match matrix
        const matrix = question.scoring_rules?.partial_matrix;
        if (matrix && matrix[str1] && matrix[str1][str2] !== undefined) {
            return { score: matrix[str1][str2], conflictFlag };
        }
        return { score: 0, conflictFlag };
    }
    return { score: 50 };
}
function generateCategoryInsight(category, score, lowestScoringQuestion) {
    if (score >= 85) {
        switch (category) {
            case 'Values & Life Goals':
                return 'Exceptional alignment on long-term vision, family aspirations, and financial mindsets. You share a unified foundation for building the future together.';
            case 'Trust & Communication':
                return 'Deep mutual trust and open emotional transparency. You both prioritize feeling safe, heard, and clear with one another.';
            case 'Conflict Style':
                return 'Highly harmonized conflict management. You navigate disagreements constructively without damaging relationship connection.';
            case 'Intimacy & Affection':
                return 'Strong intimacy alignment. Your love languages and expressions of affection naturally complement each other.';
            case 'Daily Life & Habits':
                return 'Seamless daily rhythm compatibility. Your routines, sleep cycles, and chore expectations fit together gracefully.';
            case 'Fun/Trivia':
                return 'Playful synergy! You enjoy similar experiences, food cravings, and leisure activities.';
        }
    }
    else if (score >= 65) {
        switch (category) {
            case 'Values & Life Goals':
                return 'Solid shared core values with minor nuances in lifestyle pacing or execution. Great baseline with room for ongoing goal setting.';
            case 'Trust & Communication':
                return 'Good overall communication foundation. Brief tune-ups around vulnerability during stressful moments will strengthen your bond further.';
            case 'Conflict Style':
                return 'Workable conflict resolution styles. You have minor differences in processing speed, but mutual respect keeps talks healthy.';
            case 'Intimacy & Affection':
                return 'Compatible affection preferences. A conscious check-in on love languages will ensure both partners feel fully cherished.';
            case 'Daily Life & Habits':
                return 'Fair balance in daily habits. Setting lightweight agreements on chore splits or weekend downtime will prevent minor friction.';
            case 'Fun/Trivia':
                return 'Good overlap in fun activities, with unique individual preferences that bring variety to your date nights.';
        }
    }
    else {
        switch (category) {
            case 'Values & Life Goals':
                return 'Noticeable divergence in future lifestyle or financial priorities. A dedicated, heart-to-heart discussion will help clarify mutual expectations.';
            case 'Trust & Communication':
                return 'Different expectations around emotional sharing or check-in frequency. Taking time to establish safe communication signals is recommended.';
            case 'Conflict Style':
                return 'Contrasting reactions during heated moments. Focusing on agreed cool-down boundaries will turn conflict into a tool for understanding.';
            case 'Intimacy & Affection':
                return 'Different primary love languages or affection needs. Learning each other’s unique intimacy language will unlock deeper connection.';
            case 'Daily Life & Habits':
                return 'Distinct daily rhythms and chore philosophies. Setting clear, collaborative ground rules for home life will increase harmony.';
            case 'Fun/Trivia':
                return 'Diverse tastes in hobbies and leisure! Exploring new middle-ground experiences can spark fresh adventures together.';
        }
    }
}
function computeCompatibilityScore(questions, partner1Answers, partner2Answers, session_id, couple_id, partner1_name, partner2_name) {
    const categoryQuestionScores = {
        'Values & Life Goals': [],
        'Trust & Communication': [],
        'Conflict Style': [],
        'Intimacy & Affection': [],
        'Daily Life & Habits': [],
        'Fun/Trivia': []
    };
    const conflictFlags = [];
    const reflections = [];
    for (const q of questions) {
        const p1Ans = partner1Answers[q.id];
        const p2Ans = partner2Answers[q.id];
        if (p1Ans === undefined || p2Ans === undefined) {
            continue;
        }
        if (q.question_type === 'open_ended_reflection') {
            reflections.push({
                question_id: q.id,
                question_prompt: q.prompt,
                partner1_answer: p1Ans,
                partner2_answer: p2Ans
            });
            continue;
        }
        const { score, conflictFlag } = calculateQuestionScore(q, p1Ans, p2Ans);
        if (conflictFlag) {
            conflictFlags.push(conflictFlag);
        }
        if (score !== null) {
            categoryQuestionScores[q.category].push(score);
        }
    }
    const categoryBreakdown = {};
    let weightedSum = 0;
    let totalWeightApplied = 0;
    const categories = Object.keys(types_1.CATEGORY_WEIGHTS);
    for (const cat of categories) {
        const scores = categoryQuestionScores[cat] || [];
        const catWeight = types_1.CATEGORY_WEIGHTS[cat];
        let avgScore = 0;
        if (scores.length > 0) {
            const sum = scores.reduce((acc, curr) => acc + curr, 0);
            avgScore = Math.round((sum / scores.length) * 10) / 10;
        }
        else {
            avgScore = 70; // Fallback neutral average if no questions answered in category
        }
        const insight = generateCategoryInsight(cat, avgScore);
        categoryBreakdown[cat] = {
            category: cat,
            weight: catWeight,
            score: avgScore,
            insight,
            questions_count: scores.length
        };
        weightedSum += avgScore * catWeight;
        totalWeightApplied += catWeight;
    }
    const overallScore = Math.round((weightedSum / (totalWeightApplied || 1)) * 10) / 10;
    return {
        session_id,
        couple_id,
        partner1_name,
        partner2_name,
        overall_score: overallScore,
        category_breakdown: categoryBreakdown,
        conflict_flags: conflictFlags,
        reflections,
        disclaimer: 'Heartalign is designed for reflection, self-discovery, and fun. It is not a clinical relationship assessment or psychological diagnostic tool.',
        calculated_at: new Date().toISOString()
    };
}
