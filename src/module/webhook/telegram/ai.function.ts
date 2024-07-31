import axios from 'axios';
import { Simple } from 'gs-translate-speak';
import * as path from 'path';
import * as fs from 'fs';
import * as promiseLimit from 'promise-limit';
import { config, createAudioFromText } from 'tiktok-tts';

import Helper from '../../../common/util/helper';

export default class AiFunction {
  private translateModule: any;
  private cloudflare: any;
  private tiktokSession: any;
  constructor() {
    let cloudflareAccount = process.env.CF_API_KEY.split(' ');
    this.cloudflare = cloudflareAccount.map((val) => {
      let temp = val.split('__');
      return {
        accountId: temp[0],
        token: temp[1],
      };
    });
    this.tiktokSession = process.env.TIKTOK_SESSION.split(' ');
    Helper.mkdir(path.join(__dirname, `../../../../public/audio`));
    Helper.mkdir(path.join(__dirname, `../../../../public/temp`));
  }

  mergeText(array: string[], max: number = 250, min: number = 230): string[] {
    console.log(min, max);
    let pre = [];
    let output = [];
    let next = 0;
    for (let i = 0; i < array.length; i++) {
      let tempText = array[i];

      if (tempText.length === 0) {
        continue;
      }

      if (tempText.length > max) {
        let split = Helper.splitCenter(tempText);
        pre = [...pre, ...split];
        continue;
      }

      pre.push(tempText);
    }

    for (let i = 0; i < pre.length; i++) {
      if (next > 0) {
        next -= 1;
        continue;
      }
      let tempText = pre[i];

      if (tempText.length > min && tempText.length < max) {
        output.push(tempText);
        continue;
      }

      for (let j = i + 1; j < pre.length; j++) {
        if (tempText.length + pre[j].length >= max) {
          break;
        }

        tempText = `${tempText}.${pre[j]}`;
        next++;

        if (tempText.length > min && tempText.length < max) {
          break;
        }
      }

      output.push(tempText);
    }

    return output;
  }

  async text2speech2(
    text: string,
    language: string,
    jobId: string,
  ): Promise<any> {
    let textInput: string[] = [text];
    if (text.length > 249) {
      let temp = text.split('.');
      textInput = this.mergeText(temp, 200, 160);
    }

    console.log(`Handle ${textInput.length} TTS2 - ${jobId}`);
    let folder = path.join(__dirname, `../../../../public/temp/${jobId}`);
    Helper.mkdir(folder);

    let limit = promiseLimit(1);
    let list = await Promise.all(
      textInput.map((val, index) => {
        let session = this.pickWorkspace(index, 'tiktok');
        let destination = `${folder}/${index}`;
        return limit(() =>
          this.handelTTS2(val, language, session, index, destination),
        );
      }),
    );

    return list.map((val) => `${val}.mp3`);
  }

  pickWorkspace(index, mod = 'cf'): string {
    if (mod == 'cf') {
      return this.cloudflare[
        Math.floor(Math.random() * this.cloudflare.length)
      ];
    }
    if (mod == 'tiktok') {
      return this.tiktokSession[index % this.tiktokSession.length];
    }
  }

  async handelTTS2(
    text: string,
    language: string,
    session: string,
    index: number,
    destination: string,
  ) {
    await new Promise((resolve) => setTimeout(() => resolve(true), 5000));
    console.log(
      `${index + 1} :TTS2 - ${session} - ${language} : ${index} - length = ${
        text.length
      }`,
    );
    config(session);
    await new Promise(async (resolve, reject) => {
      await createAudioFromText(text, destination, language)
        .then(resolve(true))
        .catch(async (e) => {
          console.log(e);
          await createAudioFromText(text, destination, language).catch((e) => {
            reject(e);
          });
          // reject(e);
        });
    });
    console.log('success - TTS2 - ', index + 1);
    return destination;
  }

  async mergeAudio2(id: string, data: string[]): Promise<void> {
    await Helper.delay(5000);
    let folder = path.join(__dirname, `../../../../public/temp/${id}`);
    let output = path.join(__dirname, `../../../../public/audio/${id}.mp3`);
    await Helper.mergeWav(data, output);
    await Helper.rmdir(folder);
  }

  async speechToText(destination) {
    try {
      await Helper.delay(2000);
      console.log('Starting speech to text');
      let workspace: any = this.pickWorkspace(false, 'cf');
      const binary = fs.readFileSync(destination);
      let config = {
        url: `https://api.cloudflare.com/client/v4/accounts/${workspace.accountId}/ai/run/@cf/openai/whisper`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${workspace.token}`,
          'Content-Type': 'application/octet-stream',
        },
        data: binary,
      };
      let response = await axios(config);
      return response?.data?.result?.text;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async translate(text: string, to: string): Promise<any> {
    console.log('Starting translate');
    let translateModule = new Simple();
    let output = await translateModule.translate({
      input: text,
      to: to,
    });
    return output;
  }
}
