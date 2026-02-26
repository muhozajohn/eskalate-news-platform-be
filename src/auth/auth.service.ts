import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { EncryptionService } from '../common/encryption.service';
import { UsersService } from '../users/users.service';
import { JwtPayload, LoginResponse, UserProfile } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private encryptionService: EncryptionService,
  ) {}

  async validateUser(
    identifier: string,
    password: string,
  ): Promise<UserProfile> {
    const user = await this.usersService.findByEmailOrUsername(identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { passwordHash, refreshToken, ...result } = user;
    return result;
  }

  login(user: UserProfile): LoginResponse {
    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const encryptedUserData = this.encryptionService.encryptUserData({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
    });

    return {
      access_token: accessToken,
      user: encryptedUserData,
    };
  }

  validateToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(oldToken: string): Promise<LoginResponse> {
    const decoded = this.validateToken(oldToken);
    const user = await this.usersService.findByEmail(decoded.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const { passwordHash, refreshToken, ...userWithoutSensitive } = user;
    return this.login(userWithoutSensitive);
  }

  getEncryptedProfile(user: UserProfile): string {
    return this.encryptionService.encryptUserData({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
    });
  }
}
