import { Module } from '@nestjs/common';
import { AdminSubModule } from './admin/admin.module';

@Module({
  imports: [AdminSubModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AdminModule {}
