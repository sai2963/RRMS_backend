import mongoose, { Schema, Document } from 'mongoose';
import { TABLE_STATUS } from '../constants';
import { ITable } from '../types';

export interface ITableDocument extends Omit<ITable, '_id'>, Document {}

const tableSchema = new Schema<ITableDocument>(
  {
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
      unique: true,
      min: [1, 'Table number must be at least 1'],
    },
    seatingCapacity: {
      type: Number,
      required: [true, 'Seating capacity is required'],
      min: [1, 'Seating capacity must be at least 1'],
      max: [20, 'Seating capacity cannot exceed 20'],
    },
    status: {
      type: String,
      enum: Object.values(TABLE_STATUS),
      default: TABLE_STATUS.AVAILABLE,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for frequent queries
tableSchema.index({ isActive: 1, seatingCapacity: 1 });

export const Table = mongoose.model<ITableDocument>('Table', tableSchema);
