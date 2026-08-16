import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { initDatabase } from './db/database';
import questionRoutes from './routes/questionRoutes';
import sessionRoutes from './routes/sessionRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static interactive test client
const frontendPath = path.resolve(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Initialize DB schema & question seed bank
initDatabase();

// API Routes
app.use('/api/questions', questionRoutes);
app.use('/api', sessionRoutes);

// Health Check Endpoint
app.use('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Heartalign Backend API & Scoring Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Fallback route to serve interactive API dashboard
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.resolve(frontendPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`💖 Heartalign Backend API is running on port ${PORT}`);
  console.log(`🌍 Interactive API Tester UI: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
