import { Module } from '@nestjs/common';
import { SendEmailForgotPasswordModule } from './send-email-forgot-password/send-email-forgot-password.module';

@Module({
  imports: [SendEmailForgotPasswordModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
