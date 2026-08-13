import { Budget } from '../models/Budget.js';
import { Goal } from '../models/Goal.js';

// --- BUDGET CONTROLLERS ---

export const getBudgets = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const budgets = await Budget.findByUser(userId);
    return res.status(200).json(budgets);
  } catch (error) {
    console.error('getBudgets Error:', error.message);
    return res.status(500).json({ message: 'Server error retrieving budgets' });
  }
};

export const saveBudget = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { category, monthly_limit } = req.body;

    if (!category || monthly_limit === undefined) {
      return res.status(400).json({ message: 'Category and monthly_limit are required' });
    }

    const updated = await Budget.upsertByUser(userId, category, monthly_limit);
    return res.status(200).json(updated);
  } catch (error) {
    console.error('saveBudget Error:', error.message);
    return res.status(500).json({ message: 'Server error saving budget' });
  }
};

// --- GOAL CONTROLLERS ---

export const getGoals = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const goals = await Goal.findByUser(userId);
    return res.status(200).json(goals);
  } catch (error) {
    console.error('getGoals Error:', error.message);
    return res.status(500).json({ message: 'Server error retrieving financial goals' });
  }
};

export const createGoal = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, target_amount, current_amount, target_date } = req.body;

    if (!name || target_amount === undefined) {
      return res.status(400).json({ message: 'Goal name and target_amount are required' });
    }

    const goal = await Goal.create({
      userId,
      name: String(name).trim(),
      target_amount: Number(target_amount),
      current_amount: Number(current_amount || 0),
      target_date: target_date || ''
    });

    return res.status(201).json(goal);
  } catch (error) {
    console.error('createGoal Error:', error.message);
    return res.status(500).json({ message: 'Server error creating goal' });
  }
};

export const depositGoal = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Valid deposit amount is required' });
    }

    const updated = await Goal.deposit(req.params.id, userId, amount);

    if (!updated) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error('depositGoal Error:', error.message);
    return res.status(500).json({ message: 'Server error updating goal deposit' });
  }
};
