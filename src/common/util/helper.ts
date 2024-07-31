import axios, { AxiosRequestConfig } from 'axios';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import { execSync } from 'child_process';

export default class Helper {
  static generateKey() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    let counter = 1;
    while (counter <= 24) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      if (counter % 6 === 0 && counter !== 24) {
        result += '-';
      }
      counter += 1;
    }
    return result;
  }

  static generateID(length: number = 8): string {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  static extractBacktickString(input: string) {
    const regex = /http:\/\/temp\.sh\/[^'"]*\/output\.wav/g;
    const match = input.match(regex);
    return match ? match[0] : null;
  }

  static async downloadFile(url: string, destination: string): Promise<void> {
    try {
      let config: AxiosRequestConfig = {
        method: 'GET',
        url: url,
        responseType: 'stream',
      };
      let res = await axios(config);
      res.data.pipe(fs.createWriteStream(destination));
    } catch (e) {
      console.log(e.message);
      throw e;
    }
  }

  static splitCenter(text) {
    const middle = Math.floor(text.length / 2);
    let boundary = middle;
    while (boundary < text.length && text[boundary] !== ' ') {
      boundary++;
    }
    if (boundary === text.length) {
      boundary = middle;
      while (boundary >= 0 && text[boundary] !== ' ') {
        boundary--;
      }
    }
    if (boundary === -1) {
      return [text];
    }
    const part1 = text.slice(0, boundary).trim();
    const part2 = text.slice(boundary + 1).trim();

    return [part1, part2];
  }

  static async mkdir(destination: string): Promise<void> {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
  }

  static async rmdir(destination: string): Promise<void> {
    await new Promise((resolve) => setTimeout(() => resolve(true), 3000));
    if (fs.existsSync(destination)) {
      fs.rmSync(destination, { recursive: true, force: true });
    }
  }
  static async rmFile(destination: string): Promise<void> {
    if (fs.existsSync(destination)) {
      fs.unlinkSync(destination);
    }
  }

  static getFFmpegPath(): string {
    return execSync('which ffmpeg').toString().replace('\n', '');
  }

  static async mergeWav(input: string[], destination: string): Promise<any> {
    if (input.length == 1) {
      return execSync(`mv ${input[0]} ${destination}`);
    }
    let ffmpegPath = Helper.getFFmpegPath();
    ffmpeg.setFfmpegPath(ffmpegPath);
    return new Promise((resolve, reject) => {
      let command = ffmpeg();
      input.forEach((val) => {
        command.input(val);
      });
      command
        .on('start', (cmdline) => console.log(cmdline))
        .on('end', () => {
          console.log('Merge success');
          resolve(true);
        })
        .on('error', (err) => {
          console.error('Error concatenating files:', err);
          reject(err);
        })
        .mergeToFile(destination);
    });
  }

  static flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(
        Array.isArray(toFlatten) ? Helper.flatten(toFlatten) : toFlatten,
      );
    }, []);
  }

  static getRandomNumber(min = 1000, max = 4000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static stringToRegex(str) {
    const match = str.match(/^([\/~@;%#'])(.*?)\1([gimsuy]*)$/);
    return match
      ? new RegExp(
          match[2],
          match[3]
            // Filter redundant flags, to avoid exceptions
            .split('')
            .filter((char, pos, flagArr) => flagArr.indexOf(char) === pos)
            .join(''),
        )
      : new RegExp(str);
  }

  static getFileType(link) {
    return link.split(/[.]/).pop();
  }

  static async delay(ms): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve(true), ms));
  }
}
