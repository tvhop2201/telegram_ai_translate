import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private UserService: UserService) {}

  @Post('/update')
  @UseGuards(AuthGuard())
  async updateInfo(
    @Body('fullName') fullName: string,
    @Body('phone') phone: string,
    @Request() req,
  ) {
    let data = await this.UserService.updateInfo({
      fullName,
      phone,
      _id: req.user.id,
    });
    return {
      success: true,
      code: 200,
    };
  }

  @Post('/password/change')
  @UseGuards(AuthGuard())
  async changePassword(
    @Request() req,
    @Body('current') current: string,
    @Body('newPassword') newPassword: string,
  ) {
    let data = await this.UserService.changePassword(
      req.user.id,
      current,
      newPassword,
    );

    return {
      success: true,
      code: 200,
      data,
    };
  }
}
