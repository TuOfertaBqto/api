import { forwardRef, Module } from '@nestjs/common';
import { EmailTemplate } from './entities/email-template.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { ResendHelper } from './resend/resend.helper';
import { EmailController } from './email.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailTemplate]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  providers: [EmailService, ResendHelper],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
