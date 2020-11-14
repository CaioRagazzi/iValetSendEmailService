import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SendEmailForgotPasswordDto } from './dtos/send-email-forgot-password.dto';
import { SendEmailForgotPasswordService } from './send-email-forgot-password.service';

@Controller('sendEmailForgotPassword')
export class SendEmailForgotPasswordController {
  constructor(private sendEmailForgotPasswordService: SendEmailForgotPasswordService) {}

  @Post('')
  async sendEmail(
    @Body() message: SendEmailForgotPasswordDto,
  ): Promise<void> {
    try {
      this.sendEmailForgotPasswordService.sendEmail(message);
    } catch (error) {
        console.log(error);
        
      throw new HttpException(error.sqlMessage, HttpStatus.BAD_REQUEST);
    }
  }
}
