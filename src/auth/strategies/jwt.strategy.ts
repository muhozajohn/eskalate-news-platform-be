import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload, UserProfile } from '../types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserProfile> {
    const raw = payload.email
      ? await this.usersService.findByEmail(payload.email)
      : payload.username
        ? await this.usersService.findByUsername(payload.username)
        : null;

    if (!raw) {
      throw new UnauthorizedException('User not found');
    }

    if (!raw.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    return raw as UserProfile;
  }
}
