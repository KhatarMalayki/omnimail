import nodemailer from 'nodemailer';
import db from './db';

export async function sendEmail(accountId: number, to: string, subject: string, body: string) {
  const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(accountId) as any;
  if (!account) throw new Error('Account not found');

  const transporter = nodemailer.createTransport({
    host: account.smtp_host,
    port: account.smtp_port,
    secure: account.smtp_secure === 1,
    auth: {
      user: account.username,
      pass: account.password
    }
  });

  const info = await transporter.sendMail({
    from: `"${account.display_name}" <${account.email}>`,
    to,
    subject,
    html: body
  });

  return info;
}
