export function welcomeTemplate(params: { name: string }): string {
  const { name } = params;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to electro-PI</title>
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
              <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">Welcome aboard, ${name}!</h2>
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                Your email address has been verified and your account is fully activated. You can now enjoy all the features electro-PI has to offer.
              </p>
              <ul style="margin:0 0 32px;padding:0 0 0 20px;color:#374151;font-size:15px;line-height:2;">
                <li>Browse our full product catalog</li>
                <li>Track your orders in real time</li>
                <li>Manage your saved addresses</li>
              </ul>
              <p style="margin:0;color:#9ca3af;font-size:13px;">
                If you have any questions, reply to this email — we are happy to help.
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
