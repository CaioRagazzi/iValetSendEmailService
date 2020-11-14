import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';
import Mail from 'nodemailer/lib/mailer';
import { AES } from 'crypto-js';
import {
  getYear,
  getMonth,
  getDate,
  getHours,
  getMinutes,
} from 'date-fns';
import { SendEmailForgotPasswordDto } from './dtos/send-email-forgot-password.dto';

@Injectable()
export class SendEmailForgotPasswordService {
  transporter: Mail;
  options: MailOptions = {
    from: process.env.EMAIL_USER
  }

  constructor() {
    this.transporter = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  sendEmail(
    message: SendEmailForgotPasswordDto,
  ): void {
    console.log('oi');
    
    const currentDate = new Date();
    const year = getYear(currentDate);
    const month = getMonth(currentDate);
    const day = getDate(currentDate);
    const hour = getHours(currentDate);
    const minutes = getMinutes(currentDate);

    const encriptMessage = `${message.userId}|${year}|${month}|${day}|${hour}|${minutes}`;

    const text = `
    <p>Olá <b>${message.userName},</b></p>
    <p>Você solicitou o restart de sua senha, favor clicar no link abaixo e realizar a alteração:</p>
    <p>http://ragazzitech.caioragazzi.com:82/resetpassword?hash=${AES.encrypt(
      encriptMessage,
      process.env.SECRET_CRYPTO,
    )}</p>
    <p>Atenciosamente,</p>
    <p>Equipe iValet</p> 
    `;

    this.options.to = message.to;
    this.options.subject = message.subject;
    this.options.text = text;
    this.options.html = text;

    this.transporter.sendMail(this.options);
  }
}
