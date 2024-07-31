import { Process, Processor, OnQueueCompleted } from '@nestjs/bull';
import AI from './ai.function';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import TelegramFunction from './telegram.function';
import * as path from 'path';
import Helper from 'src/common/util/helper';
import { country } from 'src/common/constants/ttVoice';
const oneDay = 1 * 60 * 60 * 24;

@Processor('telegram')
export class TelegramProcessor {
  private ai: AI = new AI();
  private telegram = TelegramFunction;
  constructor(@InjectRedis() private readonly redis: Redis) {}

  @Process({
    name: 'translate',
    concurrency: 1,
  })
  async handleTranslate(job): Promise<any> {
    // download file
    let fileLink = await this.telegram.getLinkFile(job.data.fileId);
    let fileType = Helper.getFileType(fileLink);
    let destination = path.join(
      __dirname,
      `../../../../public/temp/${job.id}.${fileType}`,
    );
    await Helper.downloadFile(fileLink, destination);

    // speech to text
    let text = await this.ai.speechToText(destination);
    if (!text) return;

    //translate
    let translated = await this.ai.translate(text, job.data.to);
    if (!translated) {
      return false;
    }
    console.log('done translation');

    // speech to text
    let list = await this.ai.text2speech2(
      translated,
      country[job.data.to],
      job.id,
    );

    //merge audio
    await this.ai.mergeAudio2(job.id, list);
    let output = path.join(__dirname, `../../../../public/audio/${job.id}.mp3`);
    let temp = path.join(__dirname, `../../../../public/temp/${job.id}`);
    let outputLink = `${process.env.BACKEND_URL}/audio/${job.id}.mp3`;

    await this.telegram.sendAudio(job.data.chatId, outputLink, {});

    setTimeout(() => {
      Helper.rmFile(destination);
      Helper.rmFile(output);
      Helper.rmFile(temp);
    }, 5000);
  }
}
