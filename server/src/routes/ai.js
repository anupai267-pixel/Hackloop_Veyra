import express from 'express';
import { aiService } from '../services/aiService.js';

const router = express.Router();

// GET /api/v1/ai/status — Modular AI Service Interface Status
router.get('/status', (req, res) => {
  const status = aiService.getStatus();
  res.json({
    success: true,
    data: status
  });
});

// POST /api/v1/ai/task — Modular task dispatch hook
router.post('/task', async (req, res) => {
  const { taskType, payload } = req.body;
  try {
    const result = await aiService.executeAgentTask(taskType, payload);
    res.json({ success: true, result });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

export default router;
