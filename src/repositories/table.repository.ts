import { Table, ITableDocument } from '../models/table.model';
import { CreateTableInput, UpdateTableInput } from '../validators/table.validator';
import { FilterQuery } from 'mongoose';

export class TableRepository {
  async findAll(filter: FilterQuery<ITableDocument> = {}): Promise<ITableDocument[]> {
    return Table.find(filter).sort({ tableNumber: 1 });
  }

  async findById(id: string): Promise<ITableDocument | null> {
    return Table.findById(id);
  }

  async findAvailable(minCapacity: number): Promise<ITableDocument[]> {
    return Table.find({
      isActive: true,
      seatingCapacity: { $gte: minCapacity },
    }).sort({ seatingCapacity: 1 }); // best-fit: smallest first
  }

  async findByTableNumber(tableNumber: number): Promise<ITableDocument | null> {
    return Table.findOne({ tableNumber });
  }

  async create(data: CreateTableInput): Promise<ITableDocument> {
    return Table.create(data);
  }

  async updateById(id: string, data: UpdateTableInput): Promise<ITableDocument | null> {
    return Table.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id: string): Promise<ITableDocument | null> {
    return Table.findByIdAndDelete(id);
  }

  async countAll(): Promise<number> {
    return Table.countDocuments();
  }
}

export const tableRepository = new TableRepository();
