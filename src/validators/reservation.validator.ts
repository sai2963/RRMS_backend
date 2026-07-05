import { z } from 'zod';
import { TIME_SLOTS, RESERVATION_STATUS, MIN_GUESTS, MAX_GUESTS } from '../constants';

export const createReservationSchema = z.object({
  body: z.object({
    reservationDate: z
      .string({ required_error: 'Reservation date is required' })
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
      .refine((val) => {
        const date = new Date(val);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        return date >= today;
      }, 'Reservation date cannot be in the past'),
    timeSlot: z.enum(TIME_SLOTS, {
      required_error: 'Time slot is required',
      invalid_type_error: `Time slot must be one of: ${TIME_SLOTS.join(', ')}`,
    }),
    guestCount: z
      .number({ required_error: 'Guest count is required' })
      .int('Guest count must be a whole number')
      .min(MIN_GUESTS, `Minimum ${MIN_GUESTS} guest required`)
      .max(MAX_GUESTS, `Maximum ${MAX_GUESTS} guests allowed`),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});

export const updateReservationSchema = z.object({
  body: z.object({
    status: z
      .enum([RESERVATION_STATUS.CONFIRMED, RESERVATION_STATUS.CANCELLED, RESERVATION_STATUS.COMPLETED], {
        invalid_type_error: 'Invalid status',
      })
      .optional(),
    reservationDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
      .optional(),
    timeSlot: z.enum(TIME_SLOTS).optional(),
    guestCount: z
      .number()
      .int()
      .min(MIN_GUESTS)
      .max(MAX_GUESTS)
      .optional(),
    notes: z.string().max(500).optional(),
  }),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>['body'];
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>['body'];
