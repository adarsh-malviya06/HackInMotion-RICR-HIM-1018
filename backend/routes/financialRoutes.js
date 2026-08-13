import express from 'express';
import { 
  getBudgets, 
  saveBudget, 
  getGoals, 
  createGoal, 
  depositGoal 
} from '../controllers/financialDataController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All budget & goal routes require JWT authentication middleware
router.use(protect);

router.get('/budgets', getBudgets);
router.post('/budgets', saveBudget);
router.get('/goals', getGoals);
router.post('/goals', createGoal);
router.post('/goals/:id/deposit', depositGoal);

export default router;
