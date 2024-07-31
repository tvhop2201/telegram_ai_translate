import axios from 'axios';
import * as https from 'https';
const config = {
  rootUrl: 'https://api.telegram.org',
  apiMode: 'bot',
  agent: new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 10000,
  }),
};

export default class TelegramFunction {
  private static async call(method: string, payload: any): Promise<any> {
    let url = `${config.rootUrl}/${config.apiMode}${process.env.TELEGRAM_TOKEN}/${method}`;
    payload.timeout = 500_000;
    payload.agent = config.agent;
    try {
      let result = await axios.post(url, payload);
      return result.data;
    } catch (e) {
      console.error(e.response.data || e);
    }
  }

  static async setWebhook(): Promise<any> {
    console.log('Webhook telegram was set !!! : ' + process.env.WEBHOOK);
    return TelegramFunction.call('setWebhook', {
      url: process.env.TELEGRAM_WEBHOOK,
    });
  }

  static async getFile(fileId: string): Promise<any> {
    return TelegramFunction.call('getFile', {
      file_id: fileId,
    });
  }

  static async getLinkFile(fileId: any): Promise<any> {
    if (typeof fileId === 'string') {
      fileId = await TelegramFunction.getFile(fileId);
    } else if (fileId.file_path === undefined) {
      fileId = await TelegramFunction.getFile(fileId.file_id);
    }
    if (!fileId?.result) {
      return null;
    }
    fileId = fileId.result;
    if (fileId.file_path !== undefined) {
      let url = `${config.rootUrl}/file/${config.apiMode}${process.env.TELEGRAM_TOKEN}/${fileId.file_path}`;
      return url;
    }
    return `${config.rootUrl}/file/${config.apiMode}${process.env.TELEGRAM_TOKEN}/${fileId.file_path}`;
  }

  static async leaveChat(chatId: string): Promise<any> {
    return TelegramFunction.call('leaveChat', {
      chat_id: chatId,
    });
  }

  static async sendMessage(
    chatId: string,
    text: string,
    extra: any,
  ): Promise<any> {
    let t = {
      text: text,
      parse_mode: 'html',
    };
    return TelegramFunction.call('sendMessage', {
      chat_id: chatId,
      ...extra,
      ...t,
    });
  }

  static async replyMessage(
    chatId: string,
    text: string,
    replyToMessageId: string,
    extra: any,
  ): Promise<any> {
    let t = {
      text: text,
      parse_mode: 'html',
    };
    return TelegramFunction.call('sendMessage', {
      chat_id: chatId,
      reply_to_message_id: replyToMessageId,
      ...extra,
      ...t,
    });
  }

  static async sendChatAction(
    chatId: string,
    action: string,
    extra: any,
  ): Promise<any> {
    return TelegramFunction.call('sendChatAction', {
      chat_id: chatId,
      action: action,
      ...extra,
    });
  }

  static async sendPhoto(
    chatId: string,
    photo: string,
    extra: any,
  ): Promise<any> {
    return TelegramFunction.call('sendPhoto', {
      chat_id: chatId,
      photo: photo,
      parse_mode: 'html',
      ...extra,
    });
  }

  static async sendVideo(
    chatId: string,
    video: string,
    extra: any,
  ): Promise<any> {
    return TelegramFunction.call('sendVideo', {
      chat_id: chatId,
      video: video,
      parse_mode: 'html',
      ...extra,
    });
  }

  static async sendDocument(
    chatId: string,
    document: string,
    extra: any,
  ): Promise<any> {
    return TelegramFunction.call('sendDocument', {
      chat_id: chatId,
      document: document,
      parse_mode: 'html',
      ...extra,
    });
  }

  static async sendAudio(
    chatId: string,
    audio: string,
    extra: any,
  ): Promise<any> {
    return TelegramFunction.call('sendAudio', {
      chat_id: chatId,
      audio: audio,
      parse_mode: 'html',
      ...extra,
    });
  }
}
