import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bull';

import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { TelegramProcessor } from './telegram.processor';

@Module({
  imports: [
    PassportModule,
    BullModule.registerQueue({
      name: 'telegram',
    }),
  ],
  controllers: [TelegramController],
  providers: [TelegramService, TelegramProcessor],
})
export class TelegramModule {}
