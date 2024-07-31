import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AdminGuard } from '../../../auth/admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private AdminService: AdminService) {}

  @Get('/info')
  @UseGuards(AuthGuard(), AdminGuard)
  async getInfo(@Request() req) {
    let data = await this.AdminService.getInfo(req.user._id);
    return {
      success: true,
      code: 200,
      data,
    };
  }
}
