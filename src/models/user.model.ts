import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES, SALT_ROUNDS } from '../constants';
import { IUser } from '../types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

// Instance method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password as string);
};

// Static method
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

export const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);
