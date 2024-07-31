import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import Email from '../common/util/email';

import { User } from '../module/client/user/user.schema';
import { Admin } from '../module/admin/admin/admin.schema';
import { UserLoginDto, UserRegisterDto } from '../module/client/user/user.dto';
import {
  AdminLoginDto,
  AdminRegisterDto,
} from '../module/admin/admin/admin.dto';

const BCRYPT_SALT = 10;
const TTL = 1000 * 60 * 3;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UseModel: Model<User>,
    @InjectModel(Admin.name) private AdminModel: Model<Admin>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private JwtService: JwtService,
  ) {}

  async register(body: UserRegisterDto, ip: string): Promise<any> {
    let { email, password, fullName, phone, avatar } = body;

    let checkEmail = await this.UseModel.findOne({ email: body.email });
    if (checkEmail) {
      throw new BadRequestException('Email already exists!');
    }

    let hash = await bcrypt.hash(password, BCRYPT_SALT);
    let data: any = {
      email,
      hash,
      fullName,
      phone,
      avatar,
      lastLoginAt: new Date(),
    };
    if (body.location) {
      data.location = {
        ...body.location,
        ip,
      };
    }
    let user = await this.UseModel.create(data).catch((e: any) => {
      throw new HttpException(e.message, 400);
    });

    let token = await this.JwtService.sign({ id: user._id });
    return {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
      },
      token,
    };
  }

  async login(body: UserLoginDto, ip: string): Promise<any> {
    const { email, password } = body;

    if (!email) {
      throw new UnauthorizedException('Invalid email!');
    }
    let filter: any = { isDelete: { $ne: true } };
    filter.email = email;
    let user = await this.UseModel.findOne(filter);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password!');
    }

    let checkPassword = await bcrypt.compare(password, user.hash);
    if (!checkPassword) {
      throw new UnauthorizedException('Invalid email or password!');
    }

    const token = this.JwtService.sign({ id: user._id });
    let updateData: any = {
      lastLoginAt: new Date(),
    };
    if (body.location) {
      updateData.location = {
        ...body.location,
        ip,
      };
    }
    await this.UseModel.updateOne({ _id: user._id }, updateData);

    return {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
      },
      token,
    };
  }

  private randomOTP(n = 6) {
    let random = Math.random().toString().split('.').pop();
    return random.slice(0, n);
  }

  async forgotPassword(email: string): Promise<any> {
    let user = await this.UseModel.findOne({ email: email });
    if (!user) {
      throw new BadRequestException('User not found !');
    }
    let check = await this.cacheManager.get(`otp-${email}`);
    if (check) {
      throw new BadRequestException('To many request');
    }
    let otp = this.randomOTP();
    let subject = 'Reset your Video-tool Password - ' + otp;
    let title = 'Reset your Video-tool Password';
    let content = `Hi ${
      user.fullName || user.email
    } <br /> <br />Forgot your password? We received a request to reset the password for your account.\n
    To reset your password, use the verification code below to continue:`;

    await Email.sendEmail(email, subject, title, content, otp);
    await this.cacheManager.set(`otp-${email}`, otp, TTL);

    return true;
  }

  async verifyOtp(code: string, email: string): Promise<any> {
    let otp = await this.cacheManager.get(`otp-${email}`);
    console.log(otp);
    if (!otp || otp !== code) {
      throw new BadRequestException('invalid otp');
    }
    let user = await this.UseModel.findOne({ email: email });
    if (!user) {
      throw new BadRequestException('User not found !');
    }
    await this.cacheManager.del(`otp-${email}`);
    let token = await this.JwtService.sign({ id: user._id });
    return {
      user: { _id: user._id },
      token: token,
    };
  }

  async adminRegister(body: AdminRegisterDto): Promise<any> {
    let { email, password, fullName, phone, avatar } = body;

    let hash = await bcrypt.hash(password, BCRYPT_SALT);

    let user = await this.AdminModel.create({
      email,
      hash,
      fullName,
      phone,
      avatar,
    }).catch((e: any) => {
      throw new HttpException(e.message, 400);
    });

    let token = await this.JwtService.sign(
      { id: user._id, admin: true },
      { secret: process.env.JWT_SECRET_ADMIN, expiresIn: '30d' },
    );
    return {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
      },
      token,
    };
  }

  async adminLogin(body: AdminLoginDto): Promise<any> {
    const { email, password } = body;

    if (!email) {
      throw new UnauthorizedException('Invalid email!');
    }
    let filter: any = {};
    filter.email = email;

    let admin = await this.AdminModel.findOne(filter);

    if (!admin) {
      throw new UnauthorizedException('Invalid email or password!');
    }

    let checkPassword = await bcrypt.compare(password, admin.hash);

    if (!checkPassword) {
      throw new UnauthorizedException('Invalid email or password!');
    }

    const token = this.JwtService.sign(
      { id: admin._id, admin: true },
      { secret: process.env.JWT_SECRET_ADMIN, expiresIn: '30d' },
    );

    return {
      user: {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        avatar: admin.avatar,
      },
      token,
    };
  }
}
