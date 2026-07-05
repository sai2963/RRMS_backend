import { User, IUserDocument } from '../models/user.model';
import { IUser } from '../types';

export class UserRepository {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findByEmail(email);
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id);
  }

  async create(data: Pick<IUser, 'name' | 'email' | 'password' | 'role'>): Promise<IUserDocument> {
    return User.create(data);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await User.findOne({ email: email.toLowerCase() });
    return user !== null;
  }
}

export const userRepository = new UserRepository();
