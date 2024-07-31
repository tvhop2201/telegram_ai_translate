import { Injectable } from '@nestjs/common';
import AiFunction from './ai.function';
import TelegramFunction from './telegram.function';
import Helper from 'src/common/util/helper';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

const commands = ['start', 'help', 'lang'];

@Injectable()
export class TelegramService {
  private ai: AiFunction;
  private telegram = TelegramFunction;
  private listLang = [{ chatId: '1234', lang: 'en' }];
  constructor(@InjectQueue('telegram') private readonly telegramQueue: Queue) {
    this.ai = new AiFunction();
    this.telegram.setWebhook();
  }

  async handle(body): Promise<any> {
    if (!body.message) {
      return false;
    }

    if (body?.message?.chat?.type === 'group') {
      return this.telegram.leaveChat(body.message.chat.id);
    }

    this.telegram.sendChatAction(body?.message?.chat?.id, 'record_voice', {});

    if (body.message?.text && body.message?.text[0] === '/') {
      return this._handleCommand(body);
    }

    if (body.message.audio) {
      return this._handleAudio(body);
    }

    if (body.message.video_note) {
      return this._handleVideoNote(body);
    }
    if (body.message.voice) {
      return this._handleVoice(body);
    }
  }

  async _handleCommand(body): Promise<any> {
    let regex: string | RegExp | any = '';
    commands.forEach((element) => {
      if (regex.length === 0) {
        regex += `\/${element}`;
      } else {
        regex += `|\/${element}`;
      }
    });
    regex = Helper.stringToRegex(`/^(${regex})(?: (.+))?$/`);
    if (!regex.test(body.message.text)) {
      return false;
    }

    let extra = body.message.text.match(regex);
    let action = extra[1].replace('/', '');
    let command = extra[1];
    let content = extra[2];

    let text =
      `<code>Hello ${body.message.from.first_name} !!</code>\n\n` +
      `/lang { code } to set the language output\n\n`;

    let textLang = `Please set language valid`;
    switch (action) {
      case 'start':
        await this.telegram.sendMessage(body.message.chat.id, text, {});
        break;
      case 'help':
        await this.telegram.sendMessage(body.message.chat.id, text, {});
        break;
      case 'lang':
        if (content.length === 0 || content.length > 2) {
          return await this.telegram.sendMessage(
            body.message.chat.id,
            textLang,
            {},
          );
        }
        let index = this.listLang.findIndex(
          (l) => l.chatId === body.message.chat.id,
        );
        if (index !== -1) {
          this.listLang[index].lang = content;
        } else {
          this.listLang.push({
            chatId: body.message.chat.id,
            lang: content,
          });
        }
        await this.telegram.sendMessage(
          body.message.chat.id,
          `<b>Success</b>`,
          {},
        );
        break;
    }
  }

  async _handleAudio(body): Promise<any> {
    let chatId = body.message.chat.id;
    let lang = this.listLang.find((val) => val?.chatId === chatId);
    if (!lang) {
      let text =
        `<code>Hello ${body.message.from.first_name} !!</code>\n\n` +
        `/lang { code } to set the language output\n\n`;
      return this.telegram.sendMessage(chatId, text, {});
    }

    let id = `telegram_${Helper.generateID()}`;
    await this.telegramQueue.add(
      'translate',
      {
        typeMessage: 'audio',
        chatId: chatId,
        to: lang.lang,
        file: body.message.audio,
        fileId: body.message.audio.file_id,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
        jobId: id,
      },
    );

    return true;
  }

  async _handleVideoNote(body): Promise<any> {
    let chatId = body.message.chat.id;
    let lang = this.listLang.find((val) => val?.chatId === chatId);
    if (!lang) {
      let text =
        `<code>Hello ${body.message.from.first_name} !!</code>\n\n` +
        `/lang { code } to set the language output\n\n`;
      return this.telegram.sendMessage(chatId, text, {});
    }
    let id = `telegram_${Helper.generateID()}`;
    await this.telegramQueue.add(
      'translate',
      {
        typeMessage: 'video_note',
        chatId: chatId,
        to: lang.lang,
        file: body.message.video_note,
        fileId: body.message?.video_note?.file_id,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
        jobId: id,
      },
    );
  }

  async _handleVoice(body): Promise<any> {
    let chatId = body.message.chat.id;
    let lang = this.listLang.find((val) => val?.chatId === chatId);
    if (!lang) {
      let text =
        `<code>Hello ${body.message.from.first_name} !!</code>\n\n` +
        `/lang { code } to set the language output\n\n`;
      return this.telegram.sendMessage(chatId, text, {});
    }
    let id = `telegram_${Helper.generateID()}`;
    await this.telegramQueue.add(
      'translate',
      {
        typeMessage: 'voice',
        chatId: chatId,
        to: lang.lang,
        file: body.message.voice,
        fileId: body.message?.voice?.file_id,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
        jobId: id,
      },
    );
  }
}
