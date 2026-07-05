import { Reservation, IReservationDocument } from '../models/reservation.model';
import { RESERVATION_STATUS } from '../constants';
import { TimeSlot } from '../constants';
import { UpdateReservationInput } from '../validators/reservation.validator';
import { FilterQuery, Types } from 'mongoose';
import { buildPaginationMeta } from '../utils/response.util';
import { PaginatedResponse } from '../types';

interface FindReservationsOptions {
  page?: number;
  pageSize?: number;
  status?: string;
  date?: string;
}

export class ReservationRepository {
  /** Find occupied table IDs for a given date + time slot (for conflict detection) */
  async findOccupiedTableIds(
    reservationDate: Date,
    timeSlot: TimeSlot,
    excludeReservationId?: string,
  ): Promise<Types.ObjectId[]> {
    const query: FilterQuery<IReservationDocument> = {
      reservationDate,
      timeSlot,
      status: { $ne: RESERVATION_STATUS.CANCELLED },
    };

    if (excludeReservationId) {
      query._id = { $ne: excludeReservationId };
    }

    const reservations = await Reservation.find(query).select('table');
    return reservations.map((r) => r.table as Types.ObjectId);
  }

  async findById(id: string): Promise<IReservationDocument | null> {
    return Reservation.findById(id).populate('customer', 'name email').populate('table');
  }

  async findByCustomer(
    customerId: string,
    options: FindReservationsOptions = {},
  ): Promise<PaginatedResponse<IReservationDocument>> {
    const { page = 1, pageSize = 10, status } = options;
    const filter: FilterQuery<IReservationDocument> = { customer: customerId };

    if (status) filter.status = status;

    const [items, totalCount] = await Promise.all([
      Reservation.find(filter)
        .populate('table')
        .sort({ reservationDate: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      Reservation.countDocuments(filter),
    ]);

    return { items, pagination: buildPaginationMeta(totalCount, page, pageSize) };
  }

  async findAll(options: FindReservationsOptions = {}): Promise<PaginatedResponse<IReservationDocument>> {
    const { page = 1, pageSize = 10, status, date } = options;
    const filter: FilterQuery<IReservationDocument> = {};

    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);
      filter.reservationDate = { $gte: start, $lte: end };
    }

    const [items, totalCount] = await Promise.all([
      Reservation.find(filter)
        .populate('customer', 'name email')
        .populate('table')
        .sort({ reservationDate: -1, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      Reservation.countDocuments(filter),
    ]);

    return { items, pagination: buildPaginationMeta(totalCount, page, pageSize) };
  }

  async findTodayReservations(): Promise<IReservationDocument[]> {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);

    return Reservation.find({
      reservationDate: { $gte: start, $lte: end },
      status: { $ne: RESERVATION_STATUS.CANCELLED },
    })
      .populate('customer', 'name email')
      .populate('table')
      .sort({ timeSlot: 1 });
  }

  async create(data: {
    customer: string;
    table: string;
    reservationDate: Date;
    timeSlot: TimeSlot;
    guestCount: number;
    notes?: string;
  }): Promise<IReservationDocument> {
    const reservation = await Reservation.create(data);
    return reservation.populate([
      { path: 'customer', select: 'name email' },
      { path: 'table' },
    ]);
  }

  async updateById(
    id: string,
    data: Partial<UpdateReservationInput & { status: string }>,
  ): Promise<IReservationDocument | null> {
    return Reservation.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('customer', 'name email')
      .populate('table');
  }

  async countByStatus(): Promise<Record<string, number>> {
    const counts = await Reservation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return counts.reduce<Record<string, number>>((acc, item: { _id: string; count: number }) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  }
}

export const reservationRepository = new ReservationRepository();
