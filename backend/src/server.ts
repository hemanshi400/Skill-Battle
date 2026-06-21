import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for local development
app.use(cors({
  origin: '*', // Let local Vite dev server connect
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json());

// Log incoming requests for development observability
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Attach API Routes
app.use('/api', apiRouter);

// Root Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Skill Battle Server is healthy', timestamp: new Date() });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Error Handler]:', err.stack || err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`⚡️ [server]: Skill Battle API is running at http://localhost:${PORT}`);
});
