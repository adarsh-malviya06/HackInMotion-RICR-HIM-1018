import express from 'express';
import { 
  getTransactions, 
  getTransactionById, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction, 
  bulkImportTransactions 
} from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All transaction routes require JWT authentication middleware
router.use(protect);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.post('/import', bulkImportTransactions);
router.get('/:id', getTransactionById);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
