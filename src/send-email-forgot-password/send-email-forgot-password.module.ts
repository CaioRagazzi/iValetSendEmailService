import { HttpModule, Module } from '@nestjs/common';
import { SendEmailForgotPasswordService } from './send-email-forgot-password.service';
import { SendEmailForgotPasswordController } from './send-email.-forgot-password.controller';

@Module({
  imports: [HttpModule],
  controllers: [SendEmailForgotPasswordController],
  providers: [SendEmailForgotPasswordService],
})
export class SendEmailForgotPasswordModule {}
