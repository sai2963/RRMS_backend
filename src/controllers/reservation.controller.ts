import { Request, Response, NextFunction } from 'express';
import { reservationService } from '../services/reservation.service';
import { sendSuccess, sendCreated } from '../utils/response.util';

export const createReservation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const reservation = await reservationService.createReservation(req.user!.userId, req.body);
    sendCreated(res, reservation, 'Reservation created successfully');
  } catch (error) {
    next(error);
  }
};

export const getMyReservations = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, pageSize, status } = req.query;
    const result = await reservationService.getMyReservations(req.user!.userId, {
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 10,
      status: status as string | undefined,
    });
    sendSuccess(res, result, 'Reservations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getReservationById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const reservation = await reservationService.getReservationById(
      req.params.id,
      req.user!.userId,
    );
    sendSuccess(res, reservation, 'Reservation retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const cancelReservation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const reservation = await reservationService.cancelReservation(
      req.params.id,
      req.user!.userId,
    );
    sendSuccess(res, reservation, 'Reservation cancelled successfully');
  } catch (error) {
    next(error);
  }
};

export const checkAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { date, timeSlot, guestCount } = req.query;

    if (!date || !timeSlot || !guestCount) {
      res.status(400).json({ success: false, message: 'date, timeSlot, and guestCount are required' });
      return;
    }

    const { tableRepository } = await import('../repositories/table.repository');
    const { reservationRepository } = await import('../repositories/reservation.repository');
    const { normaliseDateToMidnight } = await import('../utils/date.util');
    const { TIME_SLOTS } = await import('../constants');

    const reservationDate = normaliseDateToMidnight(new Date(date as string));
    const guests = parseInt(guestCount as string);
    const slot = timeSlot as string;

    if (!TIME_SLOTS.includes(slot as typeof TIME_SLOTS[number])) {
      res.status(400).json({ success: false, message: 'Invalid time slot' });
      return;
    }

    const suitableTables = await tableRepository.findAvailable(guests);
    const occupiedIds = await reservationRepository.findOccupiedTableIds(
      reservationDate,
      slot as typeof TIME_SLOTS[number],
    );
    const occupiedSet = new Set(occupiedIds.map((id) => id.toString()));
    const availableCount = suitableTables.filter((t) => !occupiedSet.has(t._id.toString())).length;

    sendSuccess(res, {
      available: availableCount > 0,
      availableTableCount: availableCount,
      date,
      timeSlot,
      guestCount: guests,
    }, 'Availability checked');
  } catch (error) {
    next(error);
  }
};
