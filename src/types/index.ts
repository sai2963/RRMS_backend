import { UserRole, ReservationStatus, TableStatus, TimeSlot } from '../constants';
import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITable {
  _id: Types.ObjectId;
  tableNumber: number;
  seatingCapacity: number;
  status: TableStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReservation {
  _id: Types.ObjectId;
  customer: Types.ObjectId | IUser;
  table: Types.ObjectId | ITable;
  reservationDate: Date;
  timeSlot: TimeSlot;
  guestCount: number;
  status: ReservationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: JwtPayload;
}
