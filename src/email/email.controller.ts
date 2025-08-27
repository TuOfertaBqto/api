import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailTemplate } from './entities/email-template.entity';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  async create(
    @Body() createTemplateDto: { name: string; html: string },
  ): Promise<EmailTemplate> {
    return await this.emailService.createTemplate(createTemplateDto);
  }

  @Get()
  async findAll(): Promise<EmailTemplate[]> {
    return await this.emailService.findAllTemplates();
  }

  @Get(':name')
  async findByName(@Param('name') name: string): Promise<EmailTemplate> {
    return await this.emailService.findTemplateByName(name);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<EmailTemplate>,
  ): Promise<EmailTemplate> {
    return await this.emailService.updateTemplate(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.emailService.removeTemplate(id);
  }
}
