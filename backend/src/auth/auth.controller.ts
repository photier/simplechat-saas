import { Controller, Post, Body, Get, UseGuards, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SetSubdomainDto } from './dto/set-subdomain.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Set HttpOnly cookie with production-grade security
   * - httpOnly: Prevents XSS attacks (JavaScript cannot access)
   * - secure: Only sent over HTTPS
   * - sameSite: Prevents CSRF attacks
   * - domain: Works across all subdomains (*.simplechat.bot)
   * - maxAge: 7 days
   */
  private setCookie(res: Response, token: string) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('auth_token', token, {
      httpOnly: true, // ✅ XSS protection
      secure: isProduction, // ✅ HTTPS only in production
      sameSite: 'lax', // ✅ CSRF protection
      domain: isProduction ? '.simplechat.bot' : undefined, // ✅ Cross-subdomain (works with api.simplechat.bot)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/', // ✅ Available on all paths
    });
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);

    // Set HttpOnly cookie with token
    if (result.token) {
      this.setCookie(res, result.token);
    }

    // Return response without token (it's in cookie now)
    return {
      message: result.message,
      email: result.email,
    };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.verifyEmail(token);

    // Set HttpOnly cookie with token for immediate login
    if (result.token) {
      this.setCookie(res, result.token);
    }

    // Return response without token
    return {
      success: result.success,
      message: result.message,
      tenantId: result.tenantId,
    };
  }

  @Post('set-subdomain')
  @UseGuards(JwtAuthGuard)
  async setSubdomain(
    @CurrentUser() user: any,
    @Body() dto: SetSubdomainDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.setSubdomain(user.id, dto.companyName);

    // Set HttpOnly cookie with new token (includes updated subdomain)
    if (result.token) {
      this.setCookie(res, result.token);
    }

    // Return tenant data without token
    return {
      tenant: result.tenant,
    };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);

    // Set HttpOnly cookie with token
    if (result.token) {
      this.setCookie(res, result.token);
    }

    // Return tenant data without token
    return {
      tenant: result.tenant,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      companyName: user.name,
      subdomain: user.subdomain,
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // Clear cookie
    res.clearCookie('auth_token', {
      domain: process.env.NODE_ENV === 'production' ? '.simplechat.bot' : undefined,
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body('token') token: string, @Body('password') password: string) {
    return this.authService.resetPassword(token, password);
  }

  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }
}
