import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

import { GlobalErrorFilter } from './common/filter/error';

import { AuthModule } from './auth/auth.module';
import { AdminModule } from './module/admin/admin.module';
import { ClientModule } from './module/client/client.module';
import { WebhookModule } from './module/webhook/webhook.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    BullModule.forRoot({
      redis: process.env.REDIS_OPTION,
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public/audio'),
      serveRoot: '/audio',
    }),
    RedisModule.forRoot({
      config: {
        url: process.env.REDIS_OPTION,
      },
    }),

    AuthModule,
    AdminModule,
    ClientModule,
    WebhookModule,
  ],

  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalErrorFilter,
    },
  ],
})
export class AppModule {}
