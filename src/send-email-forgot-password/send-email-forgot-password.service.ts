import { HttpService, Injectable, Logger } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';
import Mail from 'nodemailer/lib/mailer';
import { AES } from 'crypto-js';
import { getYear, getMonth, getDate, getHours, getMinutes } from 'date-fns';
import { SendEmailForgotPasswordDto } from './dtos/send-email-forgot-password.dto';
import { connect } from 'amqplib';

@Injectable()
export class SendEmailForgotPasswordService {
  transporter: Mail;
  options: MailOptions = {
    from: process.env.EMAIL_USER,
  };

  constructor(private httpService: HttpService) {
    this.transporter = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    this.listenToQueue();
  }

  async sendEmail(message: SendEmailForgotPasswordDto): Promise<void> {
    const user = await this.getUserByEmail(message.to);

    const currentDate = new Date();
    const year = getYear(currentDate);
    const month = getMonth(currentDate);
    const day = getDate(currentDate);
    const hour = getHours(currentDate);
    const minutes = getMinutes(currentDate);

    const encriptMessage = `${user.id}|${year}|${month}|${day}|${hour}|${minutes}`;

    const text = `
    <p>Olá <b>${user.name},</b></p>
    <p>Você solicitou o restart de sua senha, favor clicar no link abaixo e realizar a alteração:</p>
    <p>http://ragazzitech.caioragazzi.com:82/resetpassword?hash=${AES.encrypt(
      encriptMessage,
      process.env.SECRET_CRYPTO,
    )}</p>
    <p>Atenciosamente,</p>
    <p>Equipe iValet</p>
    `;

    this.options.to = message.to;
    this.options.subject = 'iValet - Recuperação de Senha!';
    this.options.text = text;
    this.options.html = text;

    this.transporter.sendMail(this.options);
  }

  async getUserByEmail(email) {
    let user;
    await this.httpService
      .get('http://localhost:3000/user/email/me', { params: { email } })
      .toPromise()
      .then(response => {
        if (response.data) {
          user = response.data;
        }
      });

    return user;
  }

  async listenToQueue() {
    const connection = connect('amqp://localhost');

    connection
      .then(conn => {
        return conn.createChannel();
      })
      .then(ch => {
        return ch
          .assertQueue('email_service', { durable: false })
          .then((ok) => {
            return ch.consume('email_service', msg => {
              const mstToSendEmail = JSON.parse(msg.content.toString());

              this.sendEmail({to: mstToSendEmail.to})

              ch.ack(msg);
            });
          });
      })
      .catch(console.warn);
  }
}
