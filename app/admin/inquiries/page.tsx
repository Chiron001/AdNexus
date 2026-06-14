import { createAdminClient } from '@/lib/supabase/server'

const STATUS_CLS: Record<string, string> = {
  new:       'bg-blue-500/20 text-blue-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  closed:    'bg-emerald-500/20 text-emerald-400',
}

const CARD = 'rounded-xl bg-white/[0.04] border border-white/[0.08]'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = '' } = await searchParams
  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (admin.from('contact_inquiries') as any)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (status && status !== 'all') query = query.eq('status', status)

  type Inquiry = {
    id: string; first_name: string; last_name: string; email: string
    phone: string; monthly_spend: string; company: string; message: string | null
    source: string | null; status: string; created_at: string
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: inquiries }, { data: counts }] = await Promise.all([
    query as unknown as Promise<{ data: Inquiry[] | null }>,
    (admin.from('contact_inquiries') as any).select('status') as Promise<{ data: { status: string }[] | null }>,
  ])

  const all   = counts ?? []
  const stats = {
    total:     all.length,
    new:       all.filter(c => c.status === 'new').length,
    contacted: all.filter(c => c.status === 'contacted').length,
    closed:    all.filter(c => c.status === 'closed').length,
  }

  const inputCls = 'rounded-lg px-3 py-2 text-sm text-zinc-300 bg-white/[0.06] border border-white/[0.10] focus:outline-none focus:ring-2 focus:ring-purple-500/50'

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Contact Inquiries</h1>
        <p className="text-sm text-zinc-500 mt-1">All inbound enquiries from the contact form</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',     value: stats.total,     cls: 'text-zinc-200'  },
          { label: 'New',       value: stats.new,       cls: 'text-blue-400'  },
          { label: 'Contacted', value: stats.contacted, cls: 'text-yellow-400'},
          { label: 'Closed',    value: stats.closed,    cls: 'text-emerald-400'},
        ].map(s => (
          <div key={s.label} className={`${CARD} p-4 text-center`}>
            <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <form method="GET" className="flex gap-3 mb-5 items-center">
        <select name="status" defaultValue={status} className={inputCls} style={{ background: 'rgba(255,255,255,0.06)' }}>
          <option value="" style={{ background: '#0f0f1a' }}>All statuses</option>
          <option value="new"       style={{ background: '#0f0f1a' }}>New</option>
          <option value="contacted" style={{ background: '#0f0f1a' }}>Contacted</option>
          <option value="closed"    style={{ background: '#0f0f1a' }}>Closed</option>
        </select>
        <button type="submit" className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors" style={{ background: 'rgba(124,58,237,0.8)' }}>
          Filter
        </button>
        <span className="ml-auto text-sm text-zinc-500">{inquiries?.length ?? 0} results</span>
      </form>

      {/* Cards */}
      <div className="space-y-4">
        {(inquiries ?? []).length === 0 && (
          <div className={`${CARD} py-14 text-center`}>
            <p className="text-sm text-zinc-500">No inquiries yet</p>
          </div>
        )}
        {(inquiries ?? []).map(inq => (
          <div key={inq.id} className={`${CARD} p-5`}>
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white">{inq.first_name} {inq.last_name}</h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_CLS[inq.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                    {inq.status}
                  </span>
                </div>
                <p className="text-sm text-zinc-400">{inq.company}</p>
              </div>
              <p className="text-xs text-zinc-500 shrink-0">{timeAgo(inq.created_at)}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Email',         value: inq.email    },
                { label: 'Phone',         value: `+91 ${inq.phone}` },
                { label: 'Monthly Spend', value: inq.monthly_spend },
                { label: 'Source',        value: inq.source ?? 'website' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg px-3 py-2 bg-white/[0.04] border border-white/[0.06]">
                  <p className="text-[10px] text-zinc-500 mb-0.5">{label}</p>
                  <p className="text-xs font-medium text-zinc-300 break-all">{value}</p>
                </div>
              ))}
            </div>

            {inq.message && (
              <div className="rounded-lg px-4 py-3 bg-white/[0.03] border border-white/[0.06] mb-4">
                <p className="text-[10px] text-zinc-500 mb-1 font-medium uppercase tracking-wide">Message</p>
                <p className="text-sm text-zinc-400 leading-relaxed">{inq.message}</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-white/[0.07]">
              <a
                href={`mailto:${inq.email}?subject=Re: Your Adnexusone Enquiry&body=Hi ${inq.first_name},%0A%0AThanks for reaching out!`}
                className="text-xs font-semibold bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 px-3 py-1.5 rounded-lg transition-colors border border-blue-500/20"
              >
                Reply via Email
              </a>
              <a
                href={`https://wa.me/91${inq.phone.replace(/\s/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 px-3 py-1.5 rounded-lg transition-colors border border-emerald-500/20"
              >
                WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
