'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Eye, EyeOff, Loader2, CheckCircle2, XCircle, AlertTriangle,
  ChevronDown, ChevronUp, ExternalLink, Trash2, RefreshCw, ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

/* ─── Types ────────────────────────────────────────────── */
interface IntegrationStatus {
  platform: string
  is_valid: boolean
  last_tested_at: string | null
}

interface FieldConfig {
  key: string
  label: string
  placeholder: string
  type?: 'text' | 'password'
  hint?: string
  required?: boolean
}

/* ─── Platform config ───────────────────────────────────── */
const PLATFORMS = {
  meta: {
    name: 'Meta Ads',
    letter: 'M',
    color: 'bg-blue-600',
    accentBorder: 'border-blue-500/25',
    accentBg: 'bg-blue-500/[0.05]',
    accentText: 'text-blue-400',
    guideUrl: 'https://developers.facebook.com/tools/explorer/',
    fields: [
      {
        key: 'access_token',
        label: 'Access Token',
        placeholder: 'EAABwzLixnjYBO...',
        type: 'password' as const,
        required: true,
        hint: 'Your Meta System User Access Token or long-lived User Access Token.',
      },
    ] as FieldConfig[],
    guide: [
      { step: '1', text: 'Go to Meta Business Manager → Settings → System Users' },
      { step: '2', text: 'Create a System User (or select existing) → Generate New Token' },
      { step: '3', text: 'Select your ad account and enable: ads_read, ads_management, business_management' },
      { step: '4', text: 'Copy the generated token and paste it above' },
    ],
    note: 'System User tokens never expire. Regular user tokens expire in 60 days.',
  },
  google: {
    name: 'Google Ads',
    letter: 'G',
    color: 'bg-green-600',
    accentBorder: 'border-green-500/25',
    accentBg: 'bg-green-500/[0.05]',
    accentText: 'text-green-400',
    guideUrl: 'https://ads.google.com/intl/en_in/home/tools/manager-accounts/',
    fields: [
      {
        key: 'developer_token',
        label: 'Developer Token',
        placeholder: 'ABcd_1234abcdef...',
        type: 'password' as const,
        required: true,
        hint: 'Found in Google Ads → Admin → API Center → Developer Token.',
      },
      {
        key: 'customer_id',
        label: 'Customer ID',
        placeholder: '123-456-7890',
        type: 'text' as const,
        required: true,
        hint: 'Your 10-digit Google Ads account ID (shown at the top-right of your Google Ads account).',
      },
      {
        key: 'client_id',
        label: 'OAuth Client ID',
        placeholder: '123456789-abc.apps.googleusercontent.com',
        type: 'text' as const,
        hint: 'From Google Cloud Console → Credentials → OAuth 2.0 Client ID (optional for basic setup).',
      },
      {
        key: 'client_secret',
        label: 'OAuth Client Secret',
        placeholder: 'GOCSPX-...',
        type: 'password' as const,
        hint: 'Paired with the OAuth Client ID above (optional for basic setup).',
      },
    ] as FieldConfig[],
    guide: [
      { step: '1', text: 'Log in to your Google Ads account (not Google Analytics)' },
      { step: '2', text: 'Go to Admin (gear icon) → Setup → API Center' },
      { step: '3', text: 'Copy your Developer Token (apply for Basic Access if not already approved)' },
      { step: '4', text: 'Copy your Customer ID from the top-right of your Google Ads dashboard' },
    ],
    note: 'Basic access is sufficient for most diagnostics. Standard/Test access required for full data range.',
  },
  amazon: {
    name: 'Amazon Ads',
    letter: 'A',
    color: 'bg-orange-500',
    accentBorder: 'border-orange-500/25',
    accentBg: 'bg-orange-500/[0.05]',
    accentText: 'text-orange-400',
    guideUrl: 'https://advertising.amazon.com/API/docs/en-us/onboarding/overview',
    fields: [
      {
        key: 'client_id',
        label: 'Client ID',
        placeholder: 'amzn1.application-oa2-client...',
        type: 'text' as const,
        required: true,
        hint: 'From your Amazon Developer Console → Login with Amazon → App registered for Advertising API.',
      },
      {
        key: 'client_secret',
        label: 'Client Secret',
        placeholder: 'abcd1234...',
        type: 'password' as const,
        required: true,
        hint: 'Paired with the Client ID above.',
      },
      {
        key: 'refresh_token',
        label: 'Refresh Token',
        placeholder: 'Atzr|...',
        type: 'password' as const,
        hint: 'OAuth refresh token obtained after authorising your Amazon Advertising account.',
      },
      {
        key: 'profile_id',
        label: 'Profile ID',
        placeholder: '1234567890',
        type: 'text' as const,
        required: true,
        hint: 'Your Amazon Advertising Profile ID — found in the Advertising Console URL or via API.',
      },
    ] as FieldConfig[],
    guide: [
      { step: '1', text: 'Go to developer.amazon.com → Login with Amazon → Create a new application' },
      { step: '2', text: 'Register for Amazon Advertising API access at advertising.amazon.com/API' },
      { step: '3', text: 'Copy the Client ID and Client Secret from your registered application' },
      { step: '4', text: 'Get your Profile ID from your Amazon Advertising console (visible in the URL)' },
    ],
    note: 'Amazon API access requires approval. Most seller/vendor accounts qualify within 1–3 business days.',
  },
} as const

type PlatformKey = keyof typeof PLATFORMS

/* ─── Single platform card ─────────────────────────────── */
function PlatformCard({
  platform,
  status,
  onSaved,
}: {
  platform: PlatformKey
  status: IntegrationStatus | undefined
  onSaved: () => void
}) {
  const cfg = PLATFORMS[platform]
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [show, setShow] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Load masked values when expanded
  useEffect(() => {
    if (!open || loaded) return
    fetch(`/api/integrations/${platform}`)
      .then(r => r.json())
      .then((data: { credentials: Record<string, string> }) => {
        setValues(data.credentials ?? {})
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [open, loaded, platform])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/integrations/${platform}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (!res.ok || !data.success) { toast.error(data.error ?? 'Failed to save'); return }
      toast.success('Credentials saved')
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    try {
      await handleSave()
      const res = await fetch(`/api/integrations/${platform}/test`, { method: 'POST' })
      const data = await res.json() as { success?: boolean; message?: string; error?: string }
      if (data.success) {
        toast.success(data.message ?? 'Connection successful')
        onSaved()
        setOpen(false)
      } else {
        toast.error(data.error ?? 'Connection test failed')
      }
    } finally {
      setTesting(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${cfg.name} integration? This will also disconnect your ad accounts.`)) return
    setDeleting(true)
    try {
      await fetch(`/api/integrations/${platform}`, { method: 'DELETE' })
      toast.success(`${cfg.name} disconnected`)
      setValues({})
      setLoaded(false)
      onSaved()
    } finally {
      setDeleting(false)
    }
  }

  const isConnected = status?.is_valid === true

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${isConnected ? cfg.accentBorder : 'border-zinc-800/80'}`}>
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 ${cfg.color} rounded-xl flex items-center justify-center text-white text-lg font-black shadow-md shrink-0`}>
            {cfg.letter}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{cfg.name}</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isConnected
                ? `Connected${status?.last_tested_at ? ` · verified ${new Date(status.last_tested_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}`
                : 'Not connected — enter credentials to activate'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isConnected
            ? <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Connected</span>
            : <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500"><AlertTriangle className="w-3.5 h-3.5" /> Not set up</span>}
          {open ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
        </div>
      </button>

      {/* Expanded form */}
      {open && (
        <div className={`border-t border-zinc-800/60 ${cfg.accentBg} p-5`}>
          {/* Guide */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">How to get your credentials</p>
              <a
                href={cfg.guideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1 text-xs font-medium ${cfg.accentText} hover:underline`}
              >
                Open {cfg.name} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="space-y-1.5">
              {cfg.guide.map(g => (
                <li key={g.step} className="flex items-start gap-2.5 text-xs text-zinc-400">
                  <span className={`shrink-0 w-4 h-4 rounded-full ${cfg.color} flex items-center justify-center text-[9px] font-black text-white`}>{g.step}</span>
                  {g.text}
                </li>
              ))}
            </ol>
            {cfg.note && (
              <p className="text-[10px] text-zinc-600 mt-2 italic">{cfg.note}</p>
            )}
          </div>

          {/* Fields */}
          <div className="space-y-4 mb-5">
            {cfg.fields.map((field) => (
              <div key={field.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={field.type === 'password' && !show[field.key] ? 'password' : 'text'}
                    value={values[field.key] ?? ''}
                    onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent pr-10 font-mono"
                  />
                  {field.type === 'password' && (
                    <button
                      type="button"
                      onClick={() => setShow(s => ({ ...s, [field.key]: !s[field.key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      {show[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {field.hint && <p className="text-[10px] text-zinc-600 mt-1 leading-relaxed">{field.hint}</p>}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTest}
              disabled={testing || saving}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              {testing ? <><Loader2 className="w-4 h-4 animate-spin" /> Testing…</> : <><RefreshCw className="w-4 h-4" /> Save & Test Connection</>}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || testing}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save only'}
            </button>
            {isConnected && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors ml-auto"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Disconnect
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────── */
export default function IntegrationsPage() {
  const [statuses, setStatuses] = useState<IntegrationStatus[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/integrations')
      if (res.ok) setStatuses(await res.json() as IntegrationStatus[])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const getStatus = (p: PlatformKey) => statuses.find(s => s.platform === p)
  const connectedCount = statuses.filter(s => s.is_valid).length

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link href="/settings" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Settings
        </Link>
        <h2 className="text-2xl font-bold text-white">Platform Integrations</h2>
        <p className="text-zinc-500 mt-1 text-sm">
          Enter your ad platform credentials. Each account is stored securely and used only for your diagnostics.
        </p>
      </div>

      {/* Status summary */}
      {!loading && (
        <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-4 py-3">
          <div className="flex gap-1.5">
            {(['meta', 'google', 'amazon'] as PlatformKey[]).map(p => {
              const s = getStatus(p)
              const cfg = PLATFORMS[p]
              return (
                <div
                  key={p}
                  title={cfg.name}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white ${s?.is_valid ? cfg.color : 'bg-zinc-700'}`}
                >
                  {cfg.letter}
                </div>
              )
            })}
          </div>
          <p className="text-sm text-zinc-400">
            {connectedCount === 0 ? 'No platforms connected yet' : `${connectedCount} of 3 platform${connectedCount > 1 ? 's' : ''} connected`}
          </p>
          {connectedCount > 0 && (
            <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Diagnostics running
            </span>
          )}
        </div>
      )}

      {/* Security note */}
      <div className="flex items-start gap-2.5 bg-zinc-900/40 border border-zinc-800/50 rounded-xl px-4 py-3">
        <div className="w-4 h-4 rounded bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Your credentials are stored encrypted in our database and are never shared. They are used only to fetch your ad account performance data for diagnostics. AdNexus has <strong className="text-zinc-400">read-only access</strong> — we cannot create, modify, or spend on your campaigns.
        </p>
      </div>

      {/* Platform cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
          </div>
        ) : (
          (['meta', 'google', 'amazon'] as PlatformKey[]).map(p => (
            <PlatformCard
              key={p}
              platform={p}
              status={getStatus(p)}
              onSaved={load}
            />
          ))
        )}
      </div>

      {/* Help footer */}
      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div>
          <p className="text-sm font-semibold text-white mb-0.5">Need help setting up?</p>
          <p className="text-xs text-zinc-500">Our setup guides walk through every platform step by step.</p>
        </div>
        <Link
          href="/help-center"
          className="shrink-0 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          Open Help Center <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}
