import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminSchema } from './admin.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{ name: 'Admin', schema: AdminSchema }]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminSubModule {}
