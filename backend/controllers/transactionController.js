import { Transaction } from '../models/Transaction.js';

// @desc    Get all transactions for authenticated user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const transactions = await Transaction.findByUser(userId);
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('getTransactions Error:', error.message);
    return res.status(500).json({ message: 'Server error retrieving transactions' });
  }
};

// @desc    Get single transaction by ID for authenticated user
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const transaction = await Transaction.findOneByUser(req.params.id, userId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.status(200).json(transaction);
  } catch (error) {
    console.error('getTransactionById Error:', error.message);
    return res.status(500).json({ message: 'Server error retrieving transaction' });
  }
};

// @desc    Create a new transaction for authenticated user
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { merchant, amount, type, category, date, raw_description, payment_method, is_recurring } = req.body;

    if (!merchant || amount === undefined || amount === null) {
      return res.status(400).json({ message: 'Merchant and amount are required' });
    }

    // STRICT SECURITY: Always override/assign userId from authenticated req.user.id
    const payload = {
      userId,
      merchant: String(merchant).trim(),
      amount: Number(amount),
      type: type === 'income' ? 'income' : 'expense',
      category: category || 'Uncategorized',
      date: date || new Date().toISOString().split('T')[0],
      raw_description: raw_description || merchant,
      payment_method: payment_method || 'Card',
      is_recurring: Boolean(is_recurring)
    };

    const newTx = await Transaction.create(payload);
    return res.status(201).json(newTx);
  } catch (error) {
    console.error('createTransaction Error:', error.message);
    return res.status(500).json({ message: 'Server error creating transaction' });
  }
};

// @desc    Update a transaction for authenticated user
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const updateData = { ...req.body };

    // STRICT SECURITY: Remove userId from request body to prevent ownership transfer
    delete updateData.userId;
    delete updateData._id;

    const updatedTx = await Transaction.updateOneByUser(req.params.id, userId, updateData);

    if (!updatedTx) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }

    return res.status(200).json(updatedTx);
  } catch (error) {
    console.error('updateTransaction Error:', error.message);
    return res.status(500).json({ message: 'Server error updating transaction' });
  }
};

// @desc    Delete a transaction for authenticated user
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const deleted = await Transaction.deleteOneByUser(req.params.id, userId);

    if (!deleted) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }

    return res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('deleteTransaction Error:', error.message);
    return res.status(500).json({ message: 'Server error deleting transaction' });
  }
};

// @desc    Bulk import transactions for authenticated user (CSV Ingestion)
// @route   POST /api/transactions/import
// @access  Private
export const bulkImportTransactions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { items } = req.body;

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: 'No items provided for import' });
    }

    // STRICT SECURITY: Attach req.user.id as owner to every single imported transaction
    const payload = items.map(t => ({
      userId,
      merchant: String(t.merchant || t.raw_description || 'Expense').trim(),
      raw_description: t.raw_description || t.merchant,
      amount: Math.abs(Number(t.amount || 0)),
      type: t.type || (Number(t.amount) < 0 ? 'expense' : 'income'),
      category: t.category || 'Uncategorized',
      date: t.date || new Date().toISOString().split('T')[0],
      payment_method: t.payment_method || 'Card',
      is_recurring: Boolean(t.is_recurring)
    }));

    const imported = await Transaction.createMany(payload);
    return res.status(201).json({ message: `Successfully imported ${imported.length} transactions`, data: imported });
  } catch (error) {
    console.error('bulkImportTransactions Error:', error.message);
    return res.status(500).json({ message: 'Server error importing transactions' });
  }
};
