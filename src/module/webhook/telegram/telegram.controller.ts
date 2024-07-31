import { Body, Controller, Post } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('webhook/telegram')
export class TelegramController {
  constructor(private telegramService: TelegramService) {}

  @Post()
  async webhookTelegram(@Body() message: any) {
    await this.telegramService.handle(message);
    return {
      success: true,
      code: 200,
    };
  }
}
