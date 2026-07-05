import mongoose, { Schema, Document } from 'mongoose';
import { RESERVATION_STATUS, TIME_SLOTS } from '../constants';
import { IReservation } from '../types';

export interface IReservationDocument extends Omit<IReservation, '_id'>, Document {}

const reservationSchema = new Schema<IReservationDocument>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
    },
    table: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      required: [true, 'Table is required'],
    },
    reservationDate: {
      type: Date,
      required: [true, 'Reservation date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      enum: TIME_SLOTS,
    },
    guestCount: {
      type: Number,
      required: [true, 'Guest count is required'],
      min: [1, 'At least 1 guest required'],
      max: [20, 'Maximum 20 guests allowed'],
    },
    status: {
      type: String,
      enum: Object.values(RESERVATION_STATUS),
      default: RESERVATION_STATUS.CONFIRMED,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for conflict detection (core engine query)
reservationSchema.index({ table: 1, reservationDate: 1, timeSlot: 1 });

// Index for customer queries
reservationSchema.index({ customer: 1, reservationDate: -1 });

// Index for admin date filters
reservationSchema.index({ reservationDate: 1, status: 1 });

export const Reservation = mongoose.model<IReservationDocument>('Reservation', reservationSchema);
