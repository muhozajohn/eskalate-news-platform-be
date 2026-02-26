import { Request } from 'express';
import { UserRole } from '../../../generated/prisma/client';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  fullName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  isVerified: boolean;
}

export interface JwtPayload {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: UserProfile;
}

export interface LoginResponse {
  access_token: string;
  user: string;
}
