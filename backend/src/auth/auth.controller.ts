import { Controller, Post, Body, Get, UseGuards, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SetSubdomainDto } from './dto/set-subdomain.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('set-subdomain')
  @UseGuards(JwtAuthGuard)
  async setSubdomain(@CurrentUser() user: any, @Body() dto: SetSubdomainDto) {
    return this.authService.setSubdomain(user.id, dto.companyName);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
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
}
