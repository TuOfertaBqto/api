import { Injectable } from '@nestjs/common';
import {
  EmailHelper,
  EmailOptions,
  EmailOptionsContent,
} from '../email.helper';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { formatHtmlString } from 'src/utils/string';

@Injectable()
export class ResendHelper implements EmailHelper {
  apiKey: string;
  sender: string;
  resend: Resend;

  constructor(configService: ConfigService) {
    this.apiKey = configService.get('RESEND_API_KEY', '');
    this.sender = configService.get('RESEND_FROM', '');
    this.resend = new Resend(this.apiKey);
  }

  async sendEmail(
    options: EmailOptions & EmailOptionsContent,
  ): Promise<boolean> {
    const { data, error } = await this.resend.emails.send({
      from: this.sender,
      to: options.recipients.map((recipient) => recipient.email),
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    if (error) {
      console.error(error);
      return false;
    }
    // TODO: Change console.log for logging
    console.log(data?.id);
    return true;
  }

  async sendEmailTemplate(
    options: EmailOptions,
    template: string,
    ...args: string[]
  ): Promise<boolean> {
    const html = formatHtmlString(template, ...args);
    const { data, error } = await this.resend.emails.send({
      from: this.sender,
      to: options.recipients.map((recipient) => recipient.email),
      subject: options.subject,
      html: html,
    });
    if (error) {
      return false;
    }
    // TODO: Change console.log for logging
    console.log(data?.id);
    return true;
  }
}
