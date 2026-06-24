export function verifyEmailTemplate(params: { name: string; otp: string }): string {
  const { name, otp } = params;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">electro-PI</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">Verify your email address</h2>
              <p style="margin:0 0 8px;color:#374151;font-size:15px;line-height:1.6;">Hi ${name},</p>
              <p style="margin:0 0 32px;color:#374151;font-size:15px;line-height:1.6;">
                Thanks for registering. Use the code below to verify your email address. This code expires in 24 hours.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 32px;">
                <tr>
                  <td style="background-color:#f3f4f6;border-radius:8px;padding:24px;text-align:center;">
                    <p style="margin:0 0 8px;color:#6b7280;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Verification Code</p>
                    <p style="margin:0;color:#111827;font-size:48px;font-weight:700;letter-spacing:16px;font-family:monospace;">${otp}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0;color:#9ca3af;font-size:13px;">
                If you did not create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">&copy; 2026 electro-PI. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
