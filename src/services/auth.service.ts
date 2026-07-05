import { userRepository } from '../repositories/user.repository';
import { generateToken } from '../utils/jwt.util';
import { HTTP_STATUS, USER_ROLES } from '../constants';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { IUserDocument } from '../models/user.model';
import { JwtPayload } from '../types';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

interface AuthResult {
  user: Omit<IUserDocument, 'password'>;
  token: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResult> {
    const exists = await userRepository.existsByEmail(input.email);
    if (exists) {
      throw new AppError('An account with this email already exists', HTTP_STATUS.CONFLICT);
    }

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: input.password,
      role: USER_ROLES.CUSTOMER,
    });

    const payload: JwtPayload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const token = generateToken(payload);

    const userObj = user.toObject();
    const { password: _password, ...userWithoutPassword } = userObj;

    return { user: userWithoutPassword as Omit<IUserDocument, 'password'>, token };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    const payload: JwtPayload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const token = generateToken(payload);

    const userObj = user.toObject();
    const { password: _password, ...userWithoutPassword } = userObj;

    return { user: userWithoutPassword as Omit<IUserDocument, 'password'>, token };
  }

  async getMe(userId: string): Promise<IUserDocument> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }
    return user;
  }
}

export const authService = new AuthService();
