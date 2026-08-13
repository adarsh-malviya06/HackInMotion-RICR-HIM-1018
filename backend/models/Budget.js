import mongoose from 'mongoose';
import { isMongoConnected } from '../config/db.js';

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    monthly_limit: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const MongooseBudget = mongoose.model('Budget', budgetSchema);
const inMemoryBudgets = [];

function buildUserFilter(userId, extra = {}) {
  const strUser = String(userId);
  let userCond = strUser;
  if (mongoose.Types.ObjectId.isValid(strUser)) {
    userCond = { $in: [strUser, new mongoose.Types.ObjectId(strUser)] };
  }
  return { userId: userCond, ...extra };
}

export const Budget = {
  async findByUser(userId) {
    const targetUserId = String(userId);
    if (isMongoConnected) {
      const filter = buildUserFilter(targetUserId);
      return await MongooseBudget.find(filter);
    }
    return inMemoryBudgets.filter(b => String(b.userId) === targetUserId);
  },

  async upsertByUser(userId, category, limit) {
    const targetUserId = String(userId);
    const cleanCategory = String(category).trim();
    const numLimit = Number(limit);

    if (isMongoConnected) {
      const filter = buildUserFilter(targetUserId, { category: cleanCategory });
      return await MongooseBudget.findOneAndUpdate(
        filter,
        { $set: { userId: targetUserId, category: cleanCategory, monthly_limit: numLimit } },
        { upsert: true, new: true }
      );
    }

    const index = inMemoryBudgets.findIndex(b => String(b.userId) === targetUserId && b.category === cleanCategory);
    if (index !== -1) {
      inMemoryBudgets[index].monthly_limit = numLimit;
      inMemoryBudgets[index].updatedAt = new Date();
      return inMemoryBudgets[index];
    }

    const newB = {
      _id: `bdg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: targetUserId,
      category: cleanCategory,
      monthly_limit: numLimit,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryBudgets.push(newB);
    return newB;
  }
};
