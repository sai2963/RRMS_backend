import { z } from 'zod';
import { TABLE_STATUS } from '../constants';

export const createTableSchema = z.object({
  body: z.object({
    tableNumber: z
      .number({ required_error: 'Table number is required' })
      .int('Table number must be a whole number')
      .min(1, 'Table number must be at least 1'),
    seatingCapacity: z
      .number({ required_error: 'Seating capacity is required' })
      .int('Seating capacity must be a whole number')
      .min(1, 'Seating capacity must be at least 1')
      .max(20, 'Seating capacity cannot exceed 20'),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateTableSchema = z.object({
  body: z.object({
    tableNumber: z.number().int().min(1).optional(),
    seatingCapacity: z.number().int().min(1).max(20).optional(),
    status: z.enum([TABLE_STATUS.AVAILABLE, TABLE_STATUS.OCCUPIED, TABLE_STATUS.MAINTENANCE]).optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateTableInput = z.infer<typeof createTableSchema>['body'];
export type UpdateTableInput = z.infer<typeof updateTableSchema>['body'];
