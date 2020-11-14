import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SendEmailForgotPasswordModule } from './send-email-forgot-password/send-email-forgot-password.module';

@Module({
  imports: [SendEmailForgotPasswordModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
