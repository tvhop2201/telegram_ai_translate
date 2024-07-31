import { Body, Controller, Ip, NotFoundException, Post } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { UserLoginDto, UserRegisterDto } from '../module/client/user/user.dto';
import {
  AdminLoginDto,
  AdminRegisterDto,
} from '../module/admin/admin/admin.dto';

@SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: UserRegisterDto, @Ip() ip) {
    const data = await this.authService.register(body, ip);
    return {
      success: true,
      code: 200,
      data,
    };
  }

  @Post('/login')
  async login(@Body() body: UserLoginDto, @Ip() ip) {
    const data = await this.authService.login(body, ip);
    return {
      success: true,
      code: 200,
      data,
    };
  }

  @Post('/forgot')
  async forgot(@Body('email') email: string) {
    let data = await this.authService.forgotPassword(email);
    return {
      success: true,
      code: 200,
    };
  }

  @SkipThrottle({ default: false })
  @Post('/otp/verify')
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    let data = await this.authService.verifyOtp(otp, email);
    return {
      success: true,
      code: 200,
      data,
    };
  }

  @Post('/admin/register')
  async adminRegister(@Body() body: AdminRegisterDto) {
    const data = await this.authService.adminRegister(body);
    return {
      success: true,
      code: 200,
      data,
    };
  }

  @Post('/admin/login')
  async adminLogin(@Body() body: AdminLoginDto) {
    const data = await this.authService.adminLogin(body);
    return {
      success: true,
      code: 200,
      data,
    };
  }
}
