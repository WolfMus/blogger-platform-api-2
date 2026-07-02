import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private MailerService: MailerService) {}

  async sendConfirmationEmail(email: string, confirmationCode: string) {
    await this.MailerService.sendMail({
      to: email,
      subject: 'Registration',
      text: 'Welcome',
      html: `<h1>Thank for your registration</h1><p>To finish registration please follow the link below:<a href='https://blogger-platform-api-lake.vercel.app/auth/registration-confirmation?code=${confirmationCode}'>complete registration</a></p>`,
    });
    console.log('Confirmation code: ', confirmationCode, ' - send to', email);
  }

  async sendPasswordRecoveryEmail(email: string, recoveryCode: string) {
    await this.MailerService.sendMail({
      to: email,
      subject: 'Recovery',
      text: 'recovery',
      html: `https://blogger-platform-api-lake.vercel.app/auth/new-password?code=${recoveryCode}`,
    });
    console.log('Recovery code: ', recoveryCode, ' - send to', email);
  }
}
