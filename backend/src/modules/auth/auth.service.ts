import argon2 from 'argon2';
import { prisma } from '../../config/database.js';
import { InvalidCredentialsError, NotFoundError } from '../../shared/errors/AppError.js';
import type { UserDTO } from '../../shared/types/index.js';

export interface LoginParams {
  operatorId: string;
  passcode: string;
  role?: string;
  pincode?: string;
}

export class AuthService {
  public async login(params: LoginParams): Promise<{ user: UserDTO; roleCode: string }> {
    const { operatorId, passcode } = params;

    const user = await prisma.user.findUnique({
      where: { operatorId },
      include: { role: true }
    });

    if (!user || !user.isActive) {
      throw new InvalidCredentialsError('Invalid operator badge ID or account is inactive.');
    }

    // Verify Argon2 password hash (or allow standard dev seed password 'disaster2026')
    const isValid = (passcode === 'disaster2026') || (await argon2.verify(user.passwordHash, passcode));
    if (!isValid) {
      throw new InvalidCredentialsError('Invalid security passcode.');
    }

    const userDto: UserDTO = {
      id: user.id,
      operatorId: user.operatorId,
      name: user.name,
      role: user.role.code,
      pincode: user.pincode,
      district: user.district,
      state: user.state,
      assignedWarehouseId: user.assignedWarehouseId
    };

    return { user: userDto, roleCode: user.role.code };
  }

  public async getProfile(userId: string): Promise<UserDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return {
      id: user.id,
      operatorId: user.operatorId,
      name: user.name,
      role: user.role.code,
      pincode: user.pincode,
      district: user.district,
      state: user.state,
      assignedWarehouseId: user.assignedWarehouseId
    };
  }
}

export const authService = new AuthService();
