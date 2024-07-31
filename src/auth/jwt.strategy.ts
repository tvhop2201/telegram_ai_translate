import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { Strategy, ExtractJwt } from '@mestrak/passport-multi-jwt';

import { User } from '../module/client/user/user.schema';
import { Admin } from '../module/admin/admin/admin.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(Admin.name) private AdminModel: Model<Admin>,
  ) {
    super([
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      },
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET_ADMIN,
      },
    ]);
  }

  async validate(payload) {
    let user: any;
    if (payload.admin) {
      user = await this.AdminModel.findOne(
        { _id: payload.id, status: true },
        { hash: 0, avatar: 0 },
      ).lean();
      user = { ...user, id: user._id, admin: true };
    } else {
      user = await this.UserModel.findOne(
        { _id: payload.id, status: true },
        { hash: 0, avatar: 0 },
      ).lean();
      user = { ...user, id: user._id, admin: false };
    }
    if (!user) {
      throw new UnauthorizedException('Access denied !');
    }
    if (user?.status === false) {
      throw new UnauthorizedException('Account is Disabled !');
    }
    return user;
  }
}
