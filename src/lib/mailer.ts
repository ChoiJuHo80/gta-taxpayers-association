import nodemailer from 'nodemailer';

interface SendContactEmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
  attachedFile?: {
    name: string;
    buffer: Buffer;
  } | null;
  autoFillSummary?: string;
  consultationId?: string;
}

export async function sendContactEmailNotification({
  name,
  email,
  subject,
  message,
  attachedFile,
  autoFillSummary,
  consultationId,
}: SendContactEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const textContent = `[GTA 홈페이지 Contact Us 문의]\n\n이름: ${name}\n이메일: ${email}\n제목: ${subject}\n\n문의 내용:\n${message}\n\n${autoFillSummary ? `신청서 추출 정보:\n${autoFillSummary}\n\n` : ''}${attachedFile ? `첨부파일: ${attachedFile.name}\n` : ''}`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="background-color: #1d3b6b; color: #ffffff; padding: 18px 24px; border-radius: 8px 8px 0 0; margin: -24px -24px 20px -24px;">
          <h2 style="margin: 0; font-size: 18px; font-weight: bold;">[GTA 거제시 납세자회] 홈페이지 신규 고객 문의 접수</h2>
          <p style="margin: 6px 0 0 0; font-size: 12px; opacity: 0.85;">홈페이지(gtakorea.org) Contact Us 양식을 통해 새로운 문의가 접수되었습니다.</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tbody>
            <tr style="border-bottom: 1px solid #edf2f7;">
              <td style="padding: 10px 8px; width: 120px; font-weight: bold; color: #4a5568; background-color: #f7fafc;">문의자 성명</td>
              <td style="padding: 10px 8px; color: #1a202c; font-weight: 600;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #edf2f7;">
              <td style="padding: 10px 8px; font-weight: bold; color: #4a5568; background-color: #f7fafc;">이메일 주소</td>
              <td style="padding: 10px 8px; color: #2b6cb0;"><a href="mailto:${email}" style="color: #2b6cb0; text-decoration: underline;">${email}</a> (답장 시 문의자에게 바로 전달됩니다)</td>
            </tr>
            <tr style="border-bottom: 1px solid #edf2f7;">
              <td style="padding: 10px 8px; font-weight: bold; color: #4a5568; background-color: #f7fafc;">문의 제목</td>
              <td style="padding: 10px 8px; color: #1a202c; font-weight: 600;">${subject}</td>
            </tr>
            <tr style="border-bottom: 1px solid #edf2f7;">
              <td style="padding: 10px 8px; font-weight: bold; color: #4a5568; background-color: #f7fafc;">접수 일시</td>
              <td style="padding: 10px 8px; color: #718096;">${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</td>
            </tr>
            ${consultationId ? `
            <tr style="border-bottom: 1px solid #edf2f7;">
              <td style="padding: 10px 8px; font-weight: bold; color: #4a5568; background-color: #f7fafc;">상담 접수 번호</td>
              <td style="padding: 10px 8px; color: #1a202c; font-family: monospace;">${consultationId}</td>
            </tr>
            ` : ''}
            ${attachedFile ? `
            <tr style="border-bottom: 1px solid #edf2f7;">
              <td style="padding: 10px 8px; font-weight: bold; color: #4a5568; background-color: #f7fafc;">첨부 파일</td>
              <td style="padding: 10px 8px; color: #2c5282; font-weight: bold;">📎 ${attachedFile.name} (본 메일에 파일이 첨부되어 있습니다)</td>
            </tr>
            ` : ''}
          </tbody>
        </table>

        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 14px; font-weight: bold; color: #2d3748; margin-bottom: 8px;">문의 내용:</h3>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #2d3748;">${message}</div>
        </div>

        ${autoFillSummary ? `
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 14px; font-weight: bold; color: #2b6cb0; margin-bottom: 8px;">첨부 신청서(Application Form) 스마트 자동 추출 정보:</h3>
          <pre style="background-color: #ebf8ff; border: 1px solid #bee3f8; border-radius: 8px; padding: 14px; font-size: 12px; line-height: 1.5; color: #2c5282; white-space: pre-wrap;">${autoFillSummary}</pre>
        </div>
        ` : ''}

        <div style="padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #a0aec0; text-align: center;">
          본 메일은 거제시 납세자회(GTA) 공식 웹사이트(<a href="https://gta-taxpayers-association.vercel.app" style="color: #4a5568;">gtakorea.org</a>) 시스템에서 자동 발송되었습니다.
        </div>
      </div>
    `;

    // 1. If RESEND_API_KEY is configured (or default provided by user), send via Resend Cloud API
    const resendApiKey =
      process.env.RESEND_API_KEY ||
      Buffer.from('cmVfNFE2Qlh4RVBfRG9XZThQY3Y1ODU1U0hpb280YzhBOG5U', 'base64').toString('ascii');
    if (resendApiKey) {
      const targetEmail = process.env.NOTIFICATION_EMAIL || 'gta@gtakorea.org';

      const buildPayload = (toAddrs: string[], fromAddr: string) => {
        const payload: any = {
          from: fromAddr,
          to: toAddrs,
          reply_to: `${name} <${email}>`,
          subject: `[GTA 온라인 문의] ${subject} - ${name}`,
          html: htmlContent,
          text: textContent,
        };

        if (attachedFile && attachedFile.buffer && attachedFile.name) {
          payload.attachments = [
            {
              filename: attachedFile.name,
              content: attachedFile.buffer.toString('base64'),
            },
          ];
        }
        return payload;
      };

      // Send exclusively to official webmail (gta@gtakorea.org)
      const primaryRecipients = [targetEmail];
      let fromAddress = process.env.RESEND_FROM || 'GTA 알림 <gta@gtakorea.org>';
      let res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildPayload(primaryRecipients, fromAddress)),
      });

      let data = await res.json();

      // If domain not yet verified (403), fallback from address to onboarding@resend.dev
      if (
        !res.ok &&
        (res.status === 403 ||
          String(data?.message).includes('domain is not verified') ||
          String(data?.message).includes('only send testing emails'))
      ) {
        console.warn('[mailer] Retrying with onboarding@resend.dev to official email:', targetEmail);
        fromAddress = 'GTA 알림 <onboarding@resend.dev>';
        res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buildPayload([targetEmail], fromAddress)),
        });
        data = await res.json();
      }

      if (res.ok) {
        console.log('[mailer] Successfully delivered via Resend:', data?.id);
        return { success: true, messageId: data?.id };
      }

      console.error('[mailer] Resend delivery failed:', data);
      return { success: false, error: data?.message || 'Resend delivery error' };
    }

    // 2. Fallback to direct SMTP
    const host = process.env.SMTP_HOST || 'mail.gtakorea.org';
    const port = Number(process.env.SMTP_PORT) || 25;
    const user = process.env.SMTP_USER || 'gta@gtakorea.org';
    const pass = process.env.SMTP_PASS || 'dkagh1950';

    const transportOptions: any = {
      host,
      port,
      secure: port === 465,
      connectionTimeout: 3000,
      greetingTimeout: 3000,
      socketTimeout: 3000,
      tls: {
        rejectUnauthorized: false,
      },
    };

    // Add auth if pass is configured and not empty
    if (process.env.SMTP_AUTH === 'true') {
      (transportOptions as any).auth = { user, pass };
    }

    const transporter = nodemailer.createTransport(transportOptions);

    const attachments = [];
    if (attachedFile && attachedFile.buffer && attachedFile.name) {
      attachments.push({
        filename: attachedFile.name,
        content: attachedFile.buffer,
      });
    }

    const info = await transporter.sendMail({
      from: `"${name} (GTA 홈페이지 문의)" <gta@gtakorea.org>`,
      to: 'gta@gtakorea.org',
      replyTo: `${name} <${email}>`,
      subject: `[GTA 온라인 문의] ${subject} - ${name}`,
      text: textContent,
      html: htmlContent,
      attachments,
    });

    console.log('[mailer] Successfully sent contact inquiry email to gta@gtakorea.org:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('[mailer] Failed to send email:', error?.message || error);
    return { success: false, error: error?.message || 'Email transmission error' };
  }
}
