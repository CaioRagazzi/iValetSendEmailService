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
  constructor(
    private sendEmailForgotPasswordService: SendEmailForgotPasswordService,
  ) {}

  @Post('')
  async sendEmail(
    @Body() message: SendEmailForgotPasswordDto,
  ): Promise<{ message: string }> {
    try {
      await this.sendEmailForgotPasswordService.sendEmail(message);

      return { message: 'E-mail enviado com sucesso!' };
    } catch (error) {
      throw new HttpException(error.sqlMessage, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('testkafka')
  async sendEmail2(): Promise<void> {
    this.sendEmailForgotPasswordService.listenToKafka();
  }
}
