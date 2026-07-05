import { Request, Response, NextFunction } from 'express';
import { reservationService } from '../services/reservation.service';
import { sendSuccess } from '../utils/response.util';

export const getAllReservations = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, pageSize, status, date } = req.query;
    const result = await reservationService.getAllReservations({
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 10,
      status: status as string | undefined,
      date: date as string | undefined,
    });
    sendSuccess(res, result, 'Reservations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAdminReservationById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const reservation = await reservationService.getReservationById(req.params.id);
    sendSuccess(res, reservation, 'Reservation retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateReservation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const reservation = await reservationService.updateReservationAdmin(req.params.id, req.body);
    sendSuccess(res, reservation, 'Reservation updated successfully');
  } catch (error) {
    next(error);
  }
};

export const cancelAnyReservation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const reservation = await reservationService.cancelReservation(req.params.id);
    sendSuccess(res, reservation, 'Reservation cancelled successfully');
  } catch (error) {
    next(error);
  }
};

export const getDashboardAnalytics = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const analytics = await reservationService.getAnalytics();
    const todayReservations = await reservationService.getTodayReservations();
    sendSuccess(res, { analytics, todayReservations }, 'Dashboard data retrieved');
  } catch (error) {
    next(error);
  }
};
