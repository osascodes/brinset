type InviteEmail = {
  to: string;
  staffName: string;
  ownerName: string;
  shopName: string;
  role: string;
  code: string;
  expiresAt: string | null;
  joinUrl: string;
};

function expiryLabel(value: string | null) {
  if (!value) return "14 days from the invite";
  return new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" });
}

export async function sendStaffInviteEmail(input: InviteEmail) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) {
    return { sent: false, error: "Email is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL." };
  }

  const expires = expiryLabel(input.expiresAt);
  const html = `
    <div style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,sans-serif;color:#18181b;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:28px;">
        <p style="margin:0 0 18px;font-size:18px;font-weight:700;color:#635BFF;">Brinset</p>
        <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;">You've been invited to join ${input.shopName}!</h1>
        <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">Hello ${input.staffName},</p>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.6;">${input.ownerName} has invited you to join ${input.shopName} on Brinset as a ${input.role}.</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Use the invitation code below to create your staff account and join the shop.</p>
        <div style="margin:0 0 18px;padding:16px;border-radius:12px;background:#f5f3ff;text-align:center;">
          <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#635BFF;">Invitation code</p>
          <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:0.18em;">${input.code}</p>
        </div>
        <p style="margin:0 0 6px;font-size:14px;"><strong>Shop:</strong> ${input.shopName}</p>
        <p style="margin:0 0 6px;font-size:14px;"><strong>Role:</strong> ${input.role}</p>
        <p style="margin:0 0 20px;font-size:14px;"><strong>Expires:</strong> ${expires}</p>
        <a href="${input.joinUrl}" style="display:inline-block;background:#635BFF;color:#ffffff;text-decoration:none;border-radius:8px;padding:12px 18px;font-weight:700;">Join Shop</a>
        <p style="margin:22px 0 0;font-size:14px;line-height:1.6;">Once you've completed registration, you'll be ready to get started. We look forward to having you on the team!</p>
        <p style="margin:16px 0 0;font-size:12px;color:#71717a;">If you weren't expecting this invitation, you can ignore this email.</p>
      </div>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: `You've been invited to join ${input.shopName} on Brinset`,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return { sent: false, error: detail || "Email could not be sent." };
  }
  return { sent: true, error: "" };
}
