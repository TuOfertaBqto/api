import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResendHelper } from './resend/resend.helper';
import { EntityManager } from 'typeorm';
import { EmailOptions, EmailOptionsContent } from './email.helper';
import { EmailTemplate } from './entities/email-template.entity';
import { formatHtmlString, formatString } from 'src/utils/string';

@Injectable()
export class EmailService {
  constructor(
    private readonly resend: ResendHelper,
    private readonly manager: EntityManager,
  ) {}

  async sendEmail(
    options: EmailOptions & EmailOptionsContent,
  ): Promise<boolean> {
    return this.resend.sendEmail(options);
  }

  async sendEmailByTemaplte(
    template: string,
    options: EmailOptions,
    ...args: string[]
  ) {
    const emailTemplate = await this.findTemplateByName(template);
    const html = formatHtmlString(emailTemplate.html, ...args);
    const text = formatString(emailTemplate.text, ...args);

    await this.sendEmail({
      recipients: options.recipients,
      subject: options.subject,
      html,
      text,
    });
  }

  async createTemplate(createTemplateDto: {
    name: string;
    html: string;
  }): Promise<EmailTemplate> {
    const existingTemplate = await this.manager.findOne(EmailTemplate, {
      where: { name: createTemplateDto.name },
    });

    if (existingTemplate) {
      throw new ConflictException(
        `A template with the name '${createTemplateDto.name}' already exists.`,
      );
    }

    const template = this.manager.create(EmailTemplate, createTemplateDto);
    return await this.manager.save(template);
  }

  async findAllTemplates(): Promise<EmailTemplate[]> {
    return await this.manager.find(EmailTemplate);
  }

  async findTemplateByName(name: string): Promise<EmailTemplate> {
    const template = await this.manager.findOne(EmailTemplate, {
      where: { name },
    });

    if (!template) {
      throw new NotFoundException(`Template with name '${name}' not found.`);
    }

    return template;
  }

  async updateTemplate(
    id: string,
    updateData: Partial<EmailTemplate>,
  ): Promise<EmailTemplate> {
    const template = await this.manager.findOne(EmailTemplate, {
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID '${id}' not found.`);
    }

    Object.assign(template, updateData);
    return this.manager.save(template);
  }

  async removeTemplate(id: string): Promise<void> {
    const template = await this.manager.findOne(EmailTemplate, {
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID '${id}' not found.`);
    }

    await this.manager.remove(template);
  }
}
