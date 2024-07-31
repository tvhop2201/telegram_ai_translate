import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Admin } from './admin.schema';

@Injectable()
export class AdminService {
  constructor(@InjectModel(Admin.name) private AdminModel: Model<Admin>) {}

  async getInfo(id: string): Promise<any> {
    let user = await this.AdminModel.findOne({ _id: id }, { hash: 0 });
    return user;
  }
}
