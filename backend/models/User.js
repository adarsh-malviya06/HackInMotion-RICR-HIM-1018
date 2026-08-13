import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { isMongoConnected } from '../config/db.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required']
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const MongooseUser = mongoose.model('User', userSchema);

// In-Memory fallback store when local MongoDB daemon is not running
const inMemoryUsers = [];

export const User = {
  async findOne({ email }) {
    const targetEmail = email.toLowerCase().trim();
    if (isMongoConnected) {
      return await MongooseUser.findOne({ email: targetEmail });
    }
    const found = inMemoryUsers.find(u => u.email === targetEmail);
    if (!found) return null;
    return {
      ...found,
      matchPassword: async (enteredPassword) => await bcrypt.compare(enteredPassword, found.passwordHash)
    };
  },

  async findById(id) {
    if (isMongoConnected) {
      return await MongooseUser.findById(id).select('-passwordHash');
    }
    const found = inMemoryUsers.find(u => String(u._id || u.id) === String(id));
    if (!found) return null;
    const { passwordHash, ...safeUser } = found;
    return safeUser;
  },

  async create({ name, email, passwordHash }) {
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    if (isMongoConnected) {
      return await MongooseUser.create({ name: cleanName, email: cleanEmail, passwordHash });
    }

    const newUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
      matchPassword: async (enteredPassword) => await bcrypt.compare(enteredPassword, passwordHash)
    };

    inMemoryUsers.push(newUser);
    return newUser;
  },

  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
};
