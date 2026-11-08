import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || '127.0.0.1',
  port: Number(process.env.SMTP_PORT) || 1025,
  secure: false,
});

export async function sendPasswordResetEmail(to, resetUrl) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'HustleHub',
    to,
    subject: 'Reset your HustleHub password',
    text: [
      'You requested to reset your password.',
      '',
      `Reset it here: ${resetUrl}`,
      '',
      'This link expires in 15 minutes and can only be used once.',
      'If this wasnt you ignore this email. Your password wont change.',
    ].join('\n'),
    html: `
      <p>You requested to reset your password.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 15 minutes and can only be used once.</p>
      <p>If you didn't ask for this, you can ignore this email. Your password wont change.</p>
    `,
  });
}
