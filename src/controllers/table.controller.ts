import { Request, Response, NextFunction } from 'express';
import { tableService } from '../services/table.service';
import { sendSuccess, sendCreated } from '../utils/response.util';

export const getAllTables = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const tables = await tableService.getAllTables(activeOnly);
    sendSuccess(res, tables, 'Tables retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createTable = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const table = await tableService.createTable(req.body);
    sendCreated(res, table, 'Table created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateTable = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const table = await tableService.updateTable(req.params.id, req.body);
    sendSuccess(res, table, 'Table updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteTable = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await tableService.deleteTable(req.params.id);
    sendSuccess(res, null, 'Table deleted successfully');
  } catch (error) {
    next(error);
  }
};
