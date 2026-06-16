import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? 're_placeholder')
  return _resend
}
const FROM = 'Adnexusone <alerts@adnexusone.in>'

interface AnomalyAlert {
  platform: string
  type: 'spend_spike' | 'roas_crash' | 'zero_conversions' | 'account_disconnected'
  campaignName?: string
  metric?: string
  accountName: string
}

export async function sendAnomalyAlert(
  email: string,
  userName: string,
  anomaly: AnomalyAlert
): Promise<void> {
  const subject = getAnomalySubject(anomaly)
  const html = getAnomalyHtml(userName, anomaly)

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject,
    html,
  })
}

export async function sendNewIssuesAlert(
  email: string,
  userName: string,
  issues: Array<{ title: string; severity: string; platform: string; estimated_impact_inr: number }>
): Promise<void> {
  const criticalCount = issues.filter((i) => i.severity === 'critical').length
  const highCount = issues.filter((i) => i.severity === 'high').length

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Adnexusone: ${criticalCount + highCount} critical/high issues detected`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
        <h2 style="color: #2563eb;">⚡ Adnexusone Issue Alert</h2>
        <p>Hi ${userName},</p>
        <p>We detected <strong>${issues.length} new issue${issues.length > 1 ? 's' : ''}</strong> in your ad accounts:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 8px 12px; text-align: left; font-size: 13px;">Platform</th>
              <th style="padding: 8px 12px; text-align: left; font-size: 13px;">Issue</th>
              <th style="padding: 8px 12px; text-align: left; font-size: 13px;">Severity</th>
              <th style="padding: 8px 12px; text-align: right; font-size: 13px;">Impact</th>
            </tr>
          </thead>
          <tbody>
            ${issues.slice(0, 10).map((issue) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 12px; font-size: 13px; text-transform: capitalize;">${issue.platform}</td>
                <td style="padding: 8px 12px; font-size: 13px;">${issue.title}</td>
                <td style="padding: 8px 12px; font-size: 13px;">
                  <span style="background: ${issue.severity === 'critical' ? '#fef2f2; color: #dc2626' : issue.severity === 'high' ? '#fff7ed; color: #ea580c' : '#fefce8; color: #ca8a04'}; padding: 2px 8px; border-radius: 4px; font-weight: 600; text-transform: capitalize;">
                    ${issue.severity}
                  </span>
                </td>
                <td style="padding: 8px 12px; font-size: 13px; text-align: right;">
                  ${issue.estimated_impact_inr > 0 ? `$${issue.estimated_impact_inr.toLocaleString('en-US')}` : '—'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/diagnostics"
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">
          View & Fix Issues →
        </a>
        <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">
          You're receiving this because you have email alerts enabled.
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #94a3b8;">Manage alerts</a>
        </p>
      </body>
      </html>
    `,
  })
}

export async function sendWeeklyDigest(
  email: string,
  userName: string,
  stats: {
    totalIssues: number
    fixedThisWeek: number
    revenueAtRisk: number
    topIssue?: { title: string; platform: string }
  }
): Promise<void> {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: 'Your Adnexusone Weekly Digest',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
        <h2 style="color: #2563eb;">📊 Weekly Ad Health Summary</h2>
        <p>Hi ${userName}, here's your week in Adnexusone:</p>
        <div style="display: flex; gap: 16px; margin: 24px 0;">
          <div style="flex: 1; background: #f8fafc; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #1e40af;">${stats.totalIssues}</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Open Issues</div>
          </div>
          <div style="flex: 1; background: #f0fdf4; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #16a34a;">${stats.fixedThisWeek}</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Fixed This Week</div>
          </div>
          <div style="flex: 1; background: #fff7ed; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 20px; font-weight: 700; color: #ea580c;">$${stats.revenueAtRisk.toLocaleString('en-US')}</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Revenue at Risk</div>
          </div>
        </div>
        ${stats.topIssue ? `
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
            <strong>Top Priority:</strong> ${stats.topIssue.title}
            <span style="color: #64748b; font-size: 13px;"> — ${stats.topIssue.platform}</span>
          </div>
        ` : ''}
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Open Dashboard →
        </a>
        <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">Adnexusone · AI-powered ad diagnostics</p>
      </body>
      </html>
    `,
  })
}

export async function sendPaymentFailedAlert(email: string, amountInr: number): Promise<void> {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: 'Adnexusone: Payment failed — action required',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
        <h2 style="color: #dc2626;">Payment Failed</h2>
        <p>We were unable to process your Adnexusone subscription payment of $${amountInr.toLocaleString('en-US')}.</p>
        <p>To continue receiving AI-powered ad diagnostics and alerts, please update your payment method.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing"
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Update Payment Method →
        </a>
      </body>
      </html>
    `,
  })
}

function getAnomalySubject(anomaly: AnomalyAlert): string {
  switch (anomaly.type) {
    case 'spend_spike':
      return `⚠️ Spend spike detected in ${anomaly.accountName}`
    case 'roas_crash':
      return `🔴 ROAS crash detected — immediate action needed`
    case 'zero_conversions':
      return `❌ Zero conversions detected with active spend`
    case 'account_disconnected':
      return `🔌 ${anomaly.platform} account disconnected — syncing stopped`
  }
}

function getAnomalyHtml(userName: string, anomaly: AnomalyAlert): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
      <h2 style="color: #dc2626;">🚨 Anomaly Detected</h2>
      <p>Hi ${userName},</p>
      <p>Adnexusone detected an anomaly in your <strong>${anomaly.accountName}</strong> account:</p>
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <strong>${anomaly.metric ?? anomaly.type.replace(/_/g, ' ')}</strong>
        ${anomaly.campaignName ? `<br><span style="color: #64748b; font-size: 13px;">Campaign: ${anomaly.campaignName}</span>` : ''}
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/diagnostics"
         style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Investigate Now →
      </a>
      <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">Adnexusone anomaly detection · <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color: #94a3b8;">Manage alerts</a></p>
    </body>
    </html>
  `
}
