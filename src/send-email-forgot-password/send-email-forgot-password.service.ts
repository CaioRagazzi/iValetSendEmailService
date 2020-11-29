import { HttpService, Injectable, Logger } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';
import Mail from 'nodemailer/lib/mailer';
import { AES } from 'crypto-js';
import { getYear, getMonth, getDate, getHours, getMinutes } from 'date-fns';
import { SendEmailForgotPasswordDto } from './dtos/send-email-forgot-password.dto';
import { connect } from 'amqplib';
import { Consumer, Kafka, TopicPartitionOffsetAndMedata } from 'kafkajs';

@Injectable()
export class SendEmailForgotPasswordService {
  transporter: Mail;
  options: MailOptions = {
    from: process.env.EMAIL_USER,
  };
  consumer: Consumer;

  constructor(private httpService: HttpService) {
    this.transporter = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const kafka = new Kafka({
      clientId: 'i-valet-email-service',
      brokers: ['localhost:9092'],
    });

    this.consumer = kafka.consumer({
      groupId: 'i-valet-email-service-forgot-email-send',
      readUncommitted: true,
      retry: {
        maxRetryTime: 5000,
      },
    });

    this.listenToKafka();
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
    console.log('enviando email');
  }

  async getUserByEmail(email) {
    try {
      const promise = await this.httpService
        .get('http://localhost:3000/user/email/me', { params: { email } })
        .toPromise();

      return promise.data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async listenToKafka() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'send_forgot_email',
      fromBeginning: true,
    });

    await this.consumer.run({
      autoCommit: false,
      eachMessage: async ({ topic, partition, message }) => {
        const offsets: TopicPartitionOffsetAndMedata[] = [];
        await this.sendEmail({ to: JSON.parse(message.value.toString()).to });
        offsets.push({ topic, partition, offset: message.offset });
        this.commitOffsets(offsets);
      },
    });
  }

  commitOffsets(topic: TopicPartitionOffsetAndMedata[]) {
    this.consumer.commitOffsets(topic);
  }
}
