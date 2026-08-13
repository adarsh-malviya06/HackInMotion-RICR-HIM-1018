import mongoose from 'mongoose';
import { isMongoConnected } from '../config/db.js';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true
    },
    merchant: {
      type: String,
      required: [true, 'Merchant name is required'],
      trim: true
    },
    raw_description: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required']
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      default: 'expense'
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'Uncategorized'
    },
    date: {
      type: String,
      required: true
    },
    payment_method: {
      type: String,
      default: 'Card'
    },
    is_recurring: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const MongooseTransaction = mongoose.model('Transaction', transactionSchema);

// In-memory fallback store when local MongoDB daemon is offline
const inMemoryTransactions = [];

function buildUserFilter(userId, extraFilter = {}) {
  const strUser = String(userId);
  let userCondition = strUser;

  if (mongoose.Types.ObjectId.isValid(strUser)) {
    userCondition = { $in: [strUser, new mongoose.Types.ObjectId(strUser)] };
  }

  return {
    userId: userCondition,
    ...extraFilter
  };
}

export const Transaction = {
  async findByUser(userId) {
    const targetUserId = String(userId);
    if (isMongoConnected) {
      const filter = buildUserFilter(targetUserId);
      return await MongooseTransaction.find(filter).sort({ date: -1, createdAt: -1 });
    }
    return inMemoryTransactions
      .filter(t => String(t.userId) === targetUserId)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  },

  async findOneByUser(id, userId) {
    const targetUserId = String(userId);
    const targetId = String(id);
    if (isMongoConnected) {
      const filter = buildUserFilter(targetUserId, { _id: targetId });
      return await MongooseTransaction.findOne(filter);
    }
    const found = inMemoryTransactions.find(t => String(t._id || t.id) === targetId && String(t.userId) === targetUserId);
    return found || null;
  },

  async create(data) {
    const payload = {
      ...data,
      userId: String(data.userId)
    };
    if (isMongoConnected) {
      return await MongooseTransaction.create(payload);
    }
    const newTx = {
      _id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      ...payload,
      amount: Number(payload.amount),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryTransactions.unshift(newTx);
    return newTx;
  },

  async createMany(itemsArray) {
    const sanitized = itemsArray.map(item => ({
      ...item,
      userId: String(item.userId)
    }));

    if (isMongoConnected) {
      return await MongooseTransaction.insertMany(sanitized);
    }
    const created = sanitized.map((data, idx) => ({
      _id: `csv_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
      ...data,
      amount: Number(data.amount),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    inMemoryTransactions.unshift(...created);
    return created;
  },

  async updateOneByUser(id, userId, updateData) {
    const targetUserId = String(userId);
    const targetId = String(id);

    // Prevent changing ownership
    delete updateData.userId;
    delete updateData._id;

    if (isMongoConnected) {
      const filter = buildUserFilter(targetUserId, { _id: targetId });
      return await MongooseTransaction.findOneAndUpdate(
        filter,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }

    const index = inMemoryTransactions.findIndex(t => String(t._id || t.id) === targetId && String(t.userId) === targetUserId);
    if (index === -1) return null;

    inMemoryTransactions[index] = {
      ...inMemoryTransactions[index],
      ...updateData,
      updatedAt: new Date()
    };
    return inMemoryTransactions[index];
  },

  async deleteOneByUser(id, userId) {
    const targetUserId = String(userId);
    const targetId = String(id);

    if (isMongoConnected) {
      const filter = buildUserFilter(targetUserId, { _id: targetId });
      const res = await MongooseTransaction.findOneAndDelete(filter);
      return Boolean(res);
    }

    const index = inMemoryTransactions.findIndex(t => String(t._id || t.id) === targetId && String(t.userId) === targetUserId);
    if (index === -1) return false;

    inMemoryTransactions.splice(index, 1);
    return true;
  }
};
