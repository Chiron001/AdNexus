import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToBuffer, Font } from '@react-pdf/renderer'
import type { DiagnosticIssue } from '@/lib/diagnostics/types'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    color: '#1a1a2e',
  },
  cover: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  coverScore: {
    fontSize: 64,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  coverScoreLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  coverDate: {
    position: 'absolute',
    bottom: 48,
    fontSize: 10,
    color: '#94a3b8',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#dbeafe',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  col: {
    flex: 1,
  },
  statBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 12,
    marginRight: 8,
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  issueRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'flex-start',
  },
  severityBadge: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 8,
    minWidth: 50,
    textAlign: 'center',
  },
  issueTitle: {
    flex: 1,
    fontSize: 10,
  },
  issueImpact: {
    fontSize: 10,
    color: '#dc2626',
    fontFamily: 'Helvetica-Bold',
    minWidth: 70,
    textAlign: 'right',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  tableCell: {
    fontSize: 9,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
})

function severityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#dc2626'
    case 'high': return '#ea580c'
    case 'medium': return '#ca8a04'
    case 'low': return '#16a34a'
    default: return '#64748b'
  }
}

interface ReportData {
  brandName: string
  generatedAt: string
  accounts: Array<{
    platform: string
    accountName: string
    issues: DiagnosticIssue[]
    metrics: Array<{
      campaign_name: string | null
      spend: number
      revenue: number
      roas: number
      conversions: number
      clicks: number
    }>
  }>
  recommendations: Array<{
    title: string
    explanation: string
    action_steps: string[]
    estimated_impact: string
    effort_level: string
    platform: string
  }>
}

function AuditReport({ data }: { data: ReportData }) {
  const allIssues = data.accounts.flatMap((a) => a.issues)
  const issueCounts = {
    critical: allIssues.filter((i) => i.severity === 'critical').length,
    high: allIssues.filter((i) => i.severity === 'high').length,
    medium: allIssues.filter((i) => i.severity === 'medium').length,
    low: allIssues.filter((i) => i.severity === 'low').length,
  }
  const healthScoreValue = Math.max(
    0,
    100 -
      Math.min(issueCounts.critical, 2) * 25 -
      Math.min(issueCounts.high, 3) * 15 -
      Math.min(issueCounts.medium, 3) * 8 -
      Math.min(issueCounts.low, 3) * 3
  )
  const healthScore = {
    score: healthScoreValue,
    label: healthScoreValue >= 80 ? 'Excellent' : healthScoreValue >= 60 ? 'Good' : healthScoreValue >= 40 ? 'Needs Attention' : healthScoreValue >= 20 ? 'Poor' : 'Critical',
  }
  const totalRevenueAtRisk = allIssues.reduce(
    (sum, i) => sum + (i.estimated_impact_inr ?? 0),
    0
  )

  return React.createElement(
    Document,
    { title: `AdNexus Audit — ${data.brandName}` },

    // Cover Page
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(
        View,
        { style: styles.cover },
        React.createElement(Text, { style: styles.coverTitle }, 'AdNexus'),
        React.createElement(Text, { style: styles.coverSubtitle }, 'AI-Powered Ad Account Audit'),
        React.createElement(Text, { style: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 32 } }, data.brandName),
        React.createElement(
          Text,
          { style: { ...styles.coverScore, color: healthScore.score >= 60 ? '#16a34a' : healthScore.score >= 40 ? '#ca8a04' : '#dc2626' } },
          String(healthScore.score)
        ),
        React.createElement(Text, { style: styles.coverScoreLabel }, `Health Score — ${healthScore.label}`),
      ),
      React.createElement(
        Text,
        { style: styles.coverDate },
        `Generated ${data.generatedAt} · AdNexus.in`
      )
    ),

    // Executive Summary
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.sectionTitle }, 'Executive Summary'),
      React.createElement(
        View,
        { style: styles.row },
        React.createElement(
          View,
          { style: styles.statBox },
          React.createElement(Text, { style: styles.statValue }, String(data.accounts.length)),
          React.createElement(Text, { style: styles.statLabel }, 'Platforms Connected')
        ),
        React.createElement(
          View,
          { style: styles.statBox },
          React.createElement(Text, { style: styles.statValue }, String(allIssues.length)),
          React.createElement(Text, { style: styles.statLabel }, 'Open Issues')
        ),
        React.createElement(
          View,
          { style: { ...styles.statBox, marginRight: 0 } },
          React.createElement(Text, { style: { ...styles.statValue, color: '#dc2626', fontSize: 16 } }, `₹${Math.round(totalRevenueAtRisk).toLocaleString('en-IN')}`),
          React.createElement(Text, { style: styles.statLabel }, 'Revenue at Risk')
        )
      ),

      React.createElement(Text, { style: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginTop: 20, marginBottom: 10 } }, 'Issues by Severity'),
      React.createElement(
        View,
        { style: styles.row },
        ...(['critical', 'high', 'medium', 'low'] as const).map((sev) => {
          const count = allIssues.filter((i) => i.severity === sev).length
          return React.createElement(
            View,
            { style: { ...styles.statBox, backgroundColor: sev === 'critical' ? '#fef2f2' : sev === 'high' ? '#fff7ed' : sev === 'medium' ? '#fefce8' : '#f0fdf4' } },
            React.createElement(Text, { style: { ...styles.statValue, color: severityColor(sev) } }, String(count)),
            React.createElement(Text, { style: { ...styles.statLabel, textTransform: 'capitalize' } }, sev)
          )
        })
      ),

      React.createElement(Text, { style: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginTop: 20, marginBottom: 10 } }, 'Top 3 Recommendations'),
      ...data.recommendations.slice(0, 3).map((rec, i) =>
        React.createElement(
          View,
          { key: String(i), style: { backgroundColor: '#eff6ff', borderRadius: 6, padding: 10, marginBottom: 8 } },
          React.createElement(Text, { style: { fontFamily: 'Helvetica-Bold', marginBottom: 4 } }, `${i + 1}. ${rec.title}`),
          React.createElement(Text, { style: { fontSize: 9, color: '#475569' } }, rec.explanation)
        )
      )
    ),

    // Issues Pages (one per platform)
    ...data.accounts.map((account) =>
      React.createElement(
        Page,
        { key: account.platform, size: 'A4', style: styles.page },
        React.createElement(Text, { style: styles.sectionTitle }, `${account.platform.charAt(0).toUpperCase() + account.platform.slice(1)} Ads — ${account.accountName}`),

        React.createElement(Text, { style: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 8 } }, `Issues (${account.issues.length})`),
        ...account.issues.slice(0, 15).map((issue, i) =>
          React.createElement(
            View,
            { key: String(i), style: styles.issueRow },
            React.createElement(
              Text,
              { style: { ...styles.severityBadge, color: severityColor(issue.severity), backgroundColor: issue.severity === 'critical' ? '#fef2f2' : issue.severity === 'high' ? '#fff7ed' : '#fefce8' } },
              issue.severity.toUpperCase()
            ),
            React.createElement(Text, { style: styles.issueTitle }, issue.title),
            React.createElement(
              Text,
              { style: styles.issueImpact },
              issue.estimated_impact_inr > 0
                ? `₹${Math.round(issue.estimated_impact_inr).toLocaleString('en-IN')}`
                : ''
            )
          )
        ),

        React.createElement(Text, { style: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 16, marginBottom: 8 } }, 'Top Campaigns by Spend'),
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(Text, { style: { ...styles.tableCell, flex: 3 } }, 'Campaign'),
          React.createElement(Text, { style: { ...styles.tableCell, flex: 1, textAlign: 'right' } }, 'Spend'),
          React.createElement(Text, { style: { ...styles.tableCell, flex: 1, textAlign: 'right' } }, 'Revenue'),
          React.createElement(Text, { style: { ...styles.tableCell, flex: 1, textAlign: 'right' } }, 'ROAS'),
        ),
        ...account.metrics.slice(0, 10).map((m, i) =>
          React.createElement(
            View,
            { key: String(i), style: { ...styles.tableRow, backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' } },
            React.createElement(Text, { style: { ...styles.tableCell, flex: 3 } }, (m.campaign_name ?? 'Unknown').substring(0, 40)),
            React.createElement(Text, { style: { ...styles.tableCell, flex: 1, textAlign: 'right' } }, `₹${Math.round(m.spend).toLocaleString('en-IN')}`),
            React.createElement(Text, { style: { ...styles.tableCell, flex: 1, textAlign: 'right' } }, `₹${Math.round(m.revenue).toLocaleString('en-IN')}`),
            React.createElement(Text, { style: { ...styles.tableCell, flex: 1, textAlign: 'right', color: m.roas >= 1 ? '#16a34a' : '#dc2626' } }, `${m.roas.toFixed(2)}x`),
          )
        ),

        React.createElement(
          View,
          { style: styles.footer },
          React.createElement(Text, { style: styles.footerText }, 'AdNexus · Confidential'),
          React.createElement(Text, { style: styles.footerText }, data.generatedAt)
        )
      )
    ),

    // Recommendations Page
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.sectionTitle }, 'AI Recommendations'),
      ...data.recommendations.slice(0, 8).map((rec, i) =>
        React.createElement(
          View,
          { key: String(i), style: { marginBottom: 16 } },
          React.createElement(
            View,
            { style: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 } },
            React.createElement(Text, { style: { fontFamily: 'Helvetica-Bold', flex: 1 } }, `${i + 1}. ${rec.title}`),
            React.createElement(
              Text,
              { style: { fontSize: 8, color: '#64748b', backgroundColor: '#f1f5f9', padding: 3, borderRadius: 3 } },
              rec.effort_level.replace('_', ' ')
            )
          ),
          React.createElement(Text, { style: { fontSize: 9, color: '#475569', marginBottom: 6 } }, rec.explanation),
          ...rec.action_steps.slice(0, 3).map((step, j) =>
            React.createElement(
              View,
              { key: String(j), style: { flexDirection: 'row', marginBottom: 2 } },
              React.createElement(Text, { style: { fontSize: 9, color: '#2563eb', marginRight: 4 } }, `${j + 1}.`),
              React.createElement(Text, { style: { fontSize: 9, color: '#1e293b', flex: 1 } }, step)
            )
          ),
          React.createElement(
            Text,
            { style: { fontSize: 9, color: '#16a34a', fontFamily: 'Helvetica-Bold', marginTop: 4 } },
            `Impact: ${rec.estimated_impact}`
          )
        )
      )
    )
  )
}

export async function generateAuditReport(data: ReportData): Promise<Uint8Array> {
  // AuditReport returns a Document element directly — cast for renderToBuffer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = AuditReport({ data }) as any
  const buffer = await renderToBuffer(element)
  return new Uint8Array(buffer)
}
