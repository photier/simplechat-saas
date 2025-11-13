import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';

/**
 * Extract JWT token from HttpOnly cookie
 * Industry standard for secure authentication
 */
const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['auth_token'];
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // ✅ Read token from HttpOnly cookie instead of Authorization header
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor, // Primary: HttpOnly cookie
        ExtractJwt.fromAuthHeaderAsBearerToken(), // Fallback: Bearer token (for API clients)
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    });
  }

  async validate(payload: any) {
    const tenant = await this.authService.validateTenant(payload.sub);

    if (!tenant) {
      throw new UnauthorizedException();
    }

    return tenant; // This will be attached to request.user
  }
}
