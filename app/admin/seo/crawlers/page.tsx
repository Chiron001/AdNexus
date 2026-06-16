'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Save, Bot, FileText, RefreshCw } from 'lucide-react'

const CARD = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
const INPUT_STYLE = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }

const DEFAULT_ROBOTS = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard
Disallow: /auth/

User-agent: GPTBot
Allow: /
Disallow: /api/
Disallow: /admin/

User-agent: AhrefsBot
Disallow: /

Sitemap: https://adnexusone.com/sitemap.xml`

const DEFAULT_LLM = `# Adnexusone — AI-Powered Ad Account Diagnostics

Adnexusone is an AI-powered ad account diagnostics platform for D2C brands and performance marketing agencies.

## Core Problem
D2C brands lose budget to invisible issues: creative fatigue, pixel failures, keyword cannibalization. Adnexusone runs automated diagnostics continuously across Meta, Google, and Amazon.

## Key Pages
- Homepage: https://adnexusone.com/
- Platform: https://adnexusone.com/platform
- Pricing: https://adnexusone.com/pricing
- Contact: https://adnexusone.com/contact`

type Tab = 'robots' | 'llm'

export default function CrawlersPage() {
  const [tab, setTab] = useState<Tab>('robots')
  const [robots, setRobots] = useState('')
  const [llm, setLlm] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/seo/crawlers')
      .then(r => r.json())
      .then(data => {
        setRobots(data.robots_txt || DEFAULT_ROBOTS)
        setLlm(data.llm_txt || DEFAULT_LLM)
      })
      .catch(() => {
        setRobots(DEFAULT_ROBOTS)
        setLlm(DEFAULT_LLM)
      })
      .finally(() => setLoading(false))
  }, [])

  async function save() {
    const key = tab === 'robots' ? 'robots_txt' : 'llm_txt'
    const value = tab === 'robots' ? robots : llm
    setSaving(true)
    try {
      const res = await fetch('/api/admin/seo/crawlers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success(`${tab === 'robots' ? 'robots.txt' : 'llm.txt'} saved — live within 60 seconds`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const currentValue = tab === 'robots' ? robots : llm
  const currentUrl = tab === 'robots' ? 'https://adnexusone.com/robots.txt' : 'https://adnexusone.com/llm.txt'

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Crawler Files</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Control what search engines and AI crawlers can access on your site</p>
        </div>
        <button
          onClick={save}
          disabled={saving || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
          style={{ background: 'rgba(124,58,237,0.85)' }}
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : 'Save & Publish'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {([
          { id: 'robots', label: 'robots.txt', icon: Bot, desc: 'Search crawlers' },
          { id: 'llm',    label: 'llm.txt',    icon: RefreshCw, desc: 'AI crawlers' },
        ] as const).map(({ id, label, icon: Icon, desc }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === id ? 'rgba(124,58,237,0.2)' : 'transparent',
              color:      tab === id ? '#a78bfa' : 'rgba(255,255,255,0.4)',
              border:     tab === id ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
            <span className="text-[10px] opacity-60">{desc}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2">
          {/* Info bar */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-500 font-mono">{currentUrl}</span>
            </div>
            <span className="text-[10px] text-zinc-600">{currentValue.split('\n').length} lines</span>
          </div>

          {/* Editor */}
          <div className="rounded-xl overflow-hidden" style={CARD}>
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 text-[11px] text-zinc-600 font-mono">
                {tab === 'robots' ? 'robots.txt' : 'llm.txt'}
              </span>
            </div>
            <textarea
              value={loading ? 'Loading…' : currentValue}
              onChange={e => tab === 'robots' ? setRobots(e.target.value) : setLlm(e.target.value)}
              disabled={loading}
              spellCheck={false}
              className="w-full font-mono text-xs text-zinc-300 resize-none outline-none leading-relaxed p-4 disabled:opacity-40"
              style={{ ...INPUT_STYLE, border: 'none', minHeight: '480px', background: 'transparent' }}
            />
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-3">
          {tab === 'robots' ? (
            <>
              <div className="rounded-xl p-4" style={CARD}>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Quick Guide</p>
                <ul className="space-y-2.5 text-xs text-zinc-400">
                  <li><code className="text-purple-400">User-agent: *</code><br />Applies to all bots</li>
                  <li><code className="text-purple-400">Allow: /path</code><br />Bots can crawl this path</li>
                  <li><code className="text-purple-400">Disallow: /path</code><br />Bots cannot crawl this path</li>
                  <li><code className="text-purple-400">Crawl-delay: 10</code><br />Seconds between requests</li>
                </ul>
              </div>
              <div className="rounded-xl p-4" style={CARD}>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">AI Bot Names</p>
                <ul className="space-y-1.5 text-xs text-zinc-500 font-mono">
                  <li className="text-zinc-400">GPTBot <span className="text-zinc-600">— OpenAI</span></li>
                  <li className="text-zinc-400">ClaudeBot <span className="text-zinc-600">— Anthropic</span></li>
                  <li className="text-zinc-400">Google-Extended <span className="text-zinc-600">— Gemini</span></li>
                  <li className="text-zinc-400">PerplexityBot</li>
                  <li className="text-zinc-400">AhrefsBot <span className="text-zinc-600">— block</span></li>
                  <li className="text-zinc-400">SemrushBot <span className="text-zinc-600">— block</span></li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl p-4" style={CARD}>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">What is llm.txt?</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  An emerging standard for AI crawlers. When ChatGPT, Claude, or Perplexity index your site, they read this file to understand what your product does — in plain language.
                </p>
              </div>
              <div className="rounded-xl p-4" style={CARD}>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Best Practices</p>
                <ul className="space-y-2 text-xs text-zinc-400">
                  <li>• Use <code className="text-purple-400"># Heading</code> for sections</li>
                  <li>• Describe what your product does in plain English</li>
                  <li>• List your key pages with full URLs</li>
                  <li>• Keep it under 2,000 words</li>
                  <li>• Update when you launch new features</li>
                </ul>
              </div>
            </>
          )}

          <div className="rounded-xl p-4" style={{ ...CARD, borderColor: 'rgba(124,58,237,0.2)' }}>
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1.5">Live URL</p>
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-zinc-200 break-all transition-colors font-mono"
            >
              {currentUrl} ↗
            </a>
            <p className="text-[10px] text-zinc-600 mt-2">Changes go live within ~60 seconds after save.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
