import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User } from './user.schema';

const BCRYPT_SALT = 10;

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  private makeid(length) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  async updateInfo(body): Promise<any> {
    if (!body._id) {
      throw new BadRequestException('User not found');
    }
    let user = await this.UserModel.findOne({ _id: body._id });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    let update = await this.UserModel.updateOne({ _id: body._id }, body);

    return update;
  }

  async changePassword(
    id: string,
    current: string,
    newPassword: string,
  ): Promise<any> {
    if (!id) {
      throw new BadRequestException('User not found');
    }
    let user = await this.UserModel.findOne({ _id: id });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    let checkPassword = await bcrypt.compare(current, user.hash);

    if (!checkPassword) {
      throw new UnauthorizedException('Invalid email or password!');
    }

    let newHash = await bcrypt.hash(newPassword, BCRYPT_SALT);

    let update = await this.UserModel.updateOne({ _id: id }, { hash: newHash });
    return update;
  }
}
