import { createAdminClient } from '@/lib/supabase/server'

const STATUS_CLS: Record<string, string> = {
  new:       'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  closed:    'bg-green-100 text-green-700',
}
const SPEND_ORDER = [
  'Under ₹1L / month', '₹1L – ₹5L / month',
  '₹5L – ₹20L / month', '₹20L – ₹1Cr / month', 'Above ₹1Cr / month',
]

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

  const all    = counts ?? []
  const stats  = {
    total:     all.length,
    new:       all.filter(c => c.status === 'new').length,
    contacted: all.filter(c => c.status === 'contacted').length,
    closed:    all.filter(c => c.status === 'closed').length,
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Contact Inquiries</h1>
        <p className="text-sm text-zinc-500 mt-1">All inbound enquiries from the contact form</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',     value: stats.total,     cls: 'text-zinc-800'   },
          { label: 'New',       value: stats.new,       cls: 'text-blue-600'   },
          { label: 'Contacted', value: stats.contacted, cls: 'text-yellow-600' },
          { label: 'Closed',    value: stats.closed,    cls: 'text-green-600'  },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-zinc-200 p-4 text-center">
            <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <form method="GET" className="flex gap-3 mb-5">
        <select
          name="status"
          defaultValue={status}
          className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
        <button type="submit" className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors">
          Filter
        </button>
        <span className="ml-auto text-sm text-zinc-400 self-center">{inquiries?.length ?? 0} results</span>
      </form>

      {/* Cards */}
      <div className="space-y-4">
        {(inquiries ?? []).length === 0 && (
          <div className="bg-white rounded-xl border border-zinc-200 py-14 text-center">
            <p className="text-sm text-zinc-400">No inquiries yet</p>
          </div>
        )}
        {(inquiries ?? []).map(inq => (
          <div key={inq.id} className="bg-white rounded-xl border border-zinc-200 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-zinc-800">{inq.first_name} {inq.last_name}</h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_CLS[inq.status] ?? 'bg-zinc-100 text-zinc-600'}`}>
                    {inq.status}
                  </span>
                </div>
                <p className="text-sm text-zinc-500">{inq.company}</p>
              </div>
              <p className="text-xs text-zinc-400 shrink-0">{timeAgo(inq.created_at)}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Email',        value: inq.email    },
                { label: 'Phone',        value: `+91 ${inq.phone}` },
                { label: 'Monthly Spend',value: inq.monthly_spend },
                { label: 'Source',       value: inq.source ?? 'website' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-zinc-50 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-zinc-400 mb-0.5">{label}</p>
                  <p className="text-xs font-medium text-zinc-700 break-all">{value}</p>
                </div>
              ))}
            </div>

            {inq.message && (
              <div className="bg-zinc-50 rounded-lg px-4 py-3 border border-zinc-100">
                <p className="text-[10px] text-zinc-400 mb-1 font-medium uppercase tracking-wide">Message</p>
                <p className="text-sm text-zinc-600 leading-relaxed">{inq.message}</p>
              </div>
            )}

            {/* Quick actions */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-100">
              <a
                href={`mailto:${inq.email}?subject=Re: Your Adnexusone Enquiry&body=Hi ${inq.first_name},%0A%0AThanks for reaching out!`}
                className="text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                Reply via Email
              </a>
              <a
                href={`https://wa.me/91${inq.phone.replace(/\s/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg transition-colors"
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
