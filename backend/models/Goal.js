import mongoose from 'mongoose';
import { isMongoConnected } from '../config/db.js';

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    target_amount: {
      type: Number,
      required: true
    },
    current_amount: {
      type: Number,
      default: 0
    },
    target_date: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const MongooseGoal = mongoose.model('Goal', goalSchema);
const inMemoryGoals = [];

function buildUserFilter(userId, extra = {}) {
  const strUser = String(userId);
  let userCond = strUser;
  if (mongoose.Types.ObjectId.isValid(strUser)) {
    userCond = { $in: [strUser, new mongoose.Types.ObjectId(strUser)] };
  }
  return { userId: userCond, ...extra };
}

export const Goal = {
  async findByUser(userId) {
    const targetUserId = String(userId);
    if (isMongoConnected) {
      const filter = buildUserFilter(targetUserId);
      return await MongooseGoal.find(filter);
    }
    return inMemoryGoals.filter(g => String(g.userId) === targetUserId);
  },

  async create(data) {
    const payload = {
      ...data,
      userId: String(data.userId),
      target_amount: Number(data.target_amount),
      current_amount: Number(data.current_amount || 0)
    };

    if (isMongoConnected) {
      return await MongooseGoal.create(payload);
    }

    const newG = {
      _id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryGoals.push(newG);
    return newG;
  },

  async deposit(id, userId, amount) {
    const targetUserId = String(userId);
    const targetId = String(id);
    const numAmount = Number(amount);

    if (isMongoConnected) {
      const filter = buildUserFilter(targetUserId, { _id: targetId });
      return await MongooseGoal.findOneAndUpdate(
        filter,
        { $inc: { current_amount: numAmount } },
        { new: true }
      );
    }

    const index = inMemoryGoals.findIndex(g => String(g._id || g.id) === targetId && String(g.userId) === targetUserId);
    if (index === -1) return null;

    inMemoryGoals[index].current_amount = (inMemoryGoals[index].current_amount || 0) + numAmount;
    inMemoryGoals[index].updatedAt = new Date();
    return inMemoryGoals[index];
  }
};
