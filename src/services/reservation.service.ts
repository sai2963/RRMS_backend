import { reservationRepository } from '../repositories/reservation.repository';
import { tableRepository } from '../repositories/table.repository';
import { IReservationDocument } from '../models/reservation.model';
import { CreateReservationInput, UpdateReservationInput } from '../validators/reservation.validator';
import { HTTP_STATUS, RESERVATION_STATUS, TimeSlot } from '../constants';
import { PaginatedResponse } from '../types';
import { AppError } from './auth.service';
import { normaliseDateToMidnight, isDateInPast } from '../utils/date.util';

interface FindReservationsOptions {
  page?: number;
  pageSize?: number;
  status?: string;
  date?: string;
}

export class ReservationService {
  /**
   * RESERVATION ENGINE
   * ─────────────────────────────────────────────────────────────
   * 1. Validate date is not in the past
   * 2. Find active tables with sufficient capacity (sorted best-fit ASC)
   * 3. Find occupied tables for the given date+slot
   * 4. Select the first available table (smallest capacity that fits)
   * 5. Create reservation atomically
   * ─────────────────────────────────────────────────────────────
   */
  async createReservation(
    customerId: string,
    input: CreateReservationInput,
  ): Promise<IReservationDocument> {
    const reservationDate = normaliseDateToMidnight(new Date(input.reservationDate));

    if (isDateInPast(reservationDate)) {
      throw new AppError('Reservation date cannot be in the past', HTTP_STATUS.BAD_REQUEST);
    }

    // Step 1: Find all active tables with enough capacity (best-fit order)
    const suitableTables = await tableRepository.findAvailable(input.guestCount);

    if (suitableTables.length === 0) {
      throw new AppError(
        `No active tables available with capacity for ${input.guestCount} guests`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // Step 2: Find already-occupied table IDs for this date+slot
    const occupiedTableIds = await reservationRepository.findOccupiedTableIds(
      reservationDate,
      input.timeSlot as TimeSlot,
    );

    const occupiedSet = new Set(occupiedTableIds.map((id) => id.toString()));

    // Step 3: Pick the first available suitable table (best-fit)
    const assignedTable = suitableTables.find((t) => !occupiedSet.has(t._id.toString()));

    if (!assignedTable) {
      throw new AppError(
        `No tables available for ${input.timeSlot} on ${input.reservationDate}. All suitable tables are booked.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // Step 4: Create the reservation
    return reservationRepository.create({
      customer: customerId,
      table: assignedTable._id.toString(),
      reservationDate,
      timeSlot: input.timeSlot as TimeSlot,
      guestCount: input.guestCount,
      notes: input.notes,
    });
  }

  async getMyReservations(
    customerId: string,
    options: FindReservationsOptions,
  ): Promise<PaginatedResponse<IReservationDocument>> {
    return reservationRepository.findByCustomer(customerId, options);
  }

  async getReservationById(id: string, customerId?: string): Promise<IReservationDocument> {
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw new AppError('Reservation not found', HTTP_STATUS.NOT_FOUND);
    }

    // Customers can only view their own reservations
    if (customerId && reservation.customer.toString() !== customerId) {
      throw new AppError('You do not have access to this reservation', HTTP_STATUS.FORBIDDEN);
    }

    return reservation;
  }

  async cancelReservation(
    id: string,
    customerId?: string,
  ): Promise<IReservationDocument> {
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw new AppError('Reservation not found', HTTP_STATUS.NOT_FOUND);
    }

    // Customers can only cancel their own reservations
    if (customerId && reservation.customer.toString() !== customerId) {
      throw new AppError('You do not have access to this reservation', HTTP_STATUS.FORBIDDEN);
    }

    if (reservation.status === RESERVATION_STATUS.CANCELLED) {
      throw new AppError('Reservation is already cancelled', HTTP_STATUS.BAD_REQUEST);
    }

    if (reservation.status === RESERVATION_STATUS.COMPLETED) {
      throw new AppError('Cannot cancel a completed reservation', HTTP_STATUS.BAD_REQUEST);
    }

    const updated = await reservationRepository.updateById(id, {
      status: RESERVATION_STATUS.CANCELLED,
    });

    return updated!;
  }

  // ─── Admin Methods ────────────────────────────────────────────

  async getAllReservations(
    options: FindReservationsOptions,
  ): Promise<PaginatedResponse<IReservationDocument>> {
    return reservationRepository.findAll(options);
  }

  async updateReservationAdmin(
    id: string,
    input: UpdateReservationInput,
  ): Promise<IReservationDocument> {
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw new AppError('Reservation not found', HTTP_STATUS.NOT_FOUND);
    }

    // If date/slot/table is being changed, re-run conflict check
    const newDate = input.reservationDate
      ? normaliseDateToMidnight(new Date(input.reservationDate))
      : reservation.reservationDate;

    const newSlot = (input.timeSlot ?? reservation.timeSlot) as TimeSlot;
    const newGuests = input.guestCount ?? reservation.guestCount;

    if (input.reservationDate || input.timeSlot) {
      const occupiedIds = await reservationRepository.findOccupiedTableIds(
        newDate,
        newSlot,
        id,
      );
      const currentTableId = reservation.table.toString();
      const isCurrentTableBlocked = occupiedIds
        .map((x) => x.toString())
        .includes(currentTableId);

      if (isCurrentTableBlocked) {
        // Try to find a new available table
        const suitableTables = await tableRepository.findAvailable(newGuests);
        const occupiedSet = new Set(occupiedIds.map((x) => x.toString()));
        const newTable = suitableTables.find((t) => !occupiedSet.has(t._id.toString()));

        if (!newTable) {
          throw new AppError(
            `No tables available for the requested date and time slot`,
            HTTP_STATUS.CONFLICT,
          );
        }
      }
    }

    const updated = await reservationRepository.updateById(id, {
      ...input,
      ...(input.reservationDate && { reservationDate: newDate.toISOString() }),
    });

    return updated!;
  }

  async getTodayReservations(): Promise<IReservationDocument[]> {
    return reservationRepository.findTodayReservations();
  }

  async getAnalytics(): Promise<{
    statusCounts: Record<string, number>;
    todayCount: number;
    totalCount: number;
  }> {
    const [statusCounts, todayReservations, allStats] = await Promise.all([
      reservationRepository.countByStatus(),
      reservationRepository.findTodayReservations(),
      reservationRepository.findAll({ pageSize: 1 }),
    ]);

    return {
      statusCounts,
      todayCount: todayReservations.length,
      totalCount: allStats.pagination.totalCount,
    };
  }
}

export const reservationService = new ReservationService();
