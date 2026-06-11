import { prisma } from "./db";
import { Resend } from "resend";

export function gerarCodigo(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function criarOtp(email: string): Promise<string> {
  // Invalida OTPs anteriores do mesmo e-mail
  await prisma.otpCode.updateMany({
    where: { email, used: false },
    data: { used: true },
  });

  const codigo = gerarCodigo();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  await prisma.otpCode.create({
    data: { email, code: codigo, expiresAt },
  });

  return codigo;
}

export async function verificarOtp(email: string, codigo: string): Promise<boolean> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      email,
      code: codigo,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otp) return false;

  await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });
  return true;
}

export async function enviarEmailOtp(email: string, nome: string, codigo: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[DEV] Código OTP para ${email}: ${codigo}`);
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Plataforma Eventos <noreply@seudominio.com>",
    to: email,
    subject: "Seu código de verificação",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1d4ed8;">Código de verificação</h2>
        <p>Olá, <strong>${nome}</strong>!</p>
        <p>Use o código abaixo para acessar sua conta. Ele expira em <strong>10 minutos</strong>.</p>
        <div style="background: #f0f4ff; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #1d4ed8;">${codigo}</span>
        </div>
        <p style="color: #888; font-size: 13px;">Se você não solicitou este código, ignore este e-mail.</p>
      </div>
    `,
  });
}
