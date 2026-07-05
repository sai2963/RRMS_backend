import { tableRepository } from '../repositories/table.repository';
import { reservationRepository } from '../repositories/reservation.repository';
import { ITableDocument } from '../models/table.model';
import { CreateTableInput, UpdateTableInput } from '../validators/table.validator';
import { HTTP_STATUS, RESERVATION_STATUS } from '../constants';
import { AppError } from './auth.service';

export class TableService {
  async getAllTables(activeOnly = false): Promise<ITableDocument[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return tableRepository.findAll(filter);
  }

  async createTable(input: CreateTableInput): Promise<ITableDocument> {
    const existing = await tableRepository.findByTableNumber(input.tableNumber);
    if (existing) {
      throw new AppError(
        `Table number ${input.tableNumber} already exists`,
        HTTP_STATUS.CONFLICT,
      );
    }
    return tableRepository.create(input);
  }

  async updateTable(id: string, input: UpdateTableInput): Promise<ITableDocument> {
    if (input.tableNumber !== undefined) {
      const existing = await tableRepository.findByTableNumber(input.tableNumber);
      if (existing && existing._id.toString() !== id) {
        throw new AppError(
          `Table number ${input.tableNumber} is already in use`,
          HTTP_STATUS.CONFLICT,
        );
      }
    }

    const table = await tableRepository.updateById(id, input);
    if (!table) {
      throw new AppError('Table not found', HTTP_STATUS.NOT_FOUND);
    }
    return table;
  }

  async deleteTable(id: string): Promise<void> {
    const table = await tableRepository.findById(id);
    if (!table) {
      throw new AppError('Table not found', HTTP_STATUS.NOT_FOUND);
    }

    // Prevent deletion if table has future active reservations
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const futureReservations = await reservationRepository.findAll({
      status: RESERVATION_STATUS.CONFIRMED,
    });

    const hasActiveReservations = futureReservations.items.some(
      (r) => r.table.toString() === id,
    );

    if (hasActiveReservations) {
      throw new AppError(
        'Cannot delete a table with active future reservations. Deactivate it instead.',
        HTTP_STATUS.CONFLICT,
      );
    }

    await tableRepository.deleteById(id);
  }
}

export const tableService = new TableService();
