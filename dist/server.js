"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./db/database");
const questionRoutes_1 = __importDefault(require("./routes/questionRoutes"));
const sessionRoutes_1 = __importDefault(require("./routes/sessionRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve static interactive test client
app.use(express_1.default.static(path_1.default.resolve(__dirname, '../public')));
// Initialize DB schema & question seed bank
(0, database_1.initDatabase)();
// API Routes
app.use('/api/questions', questionRoutes_1.default);
app.use('/api', sessionRoutes_1.default);
// Health Check Endpoint
app.use('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        app: 'Heartalign Backend API & Scoring Engine',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
// Fallback route to serve interactive API dashboard
app.get('*', (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname, '../public/index.html'));
});
// Start Server
app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`💖 Heartalign Backend API is running on port ${PORT}`);
    console.log(`🌍 Interactive API Tester UI: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
});
