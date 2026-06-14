'use client'

import { useState } from 'react'
import { toast } from 'sonner'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload  = () => resolve()
    s.onerror = () => reject(new Error('Razorpay SDK failed to load'))
    document.head.appendChild(s)
  })
}

interface Props {
  plan: 'basic' | 'growth' | 'professional' | 'ai'
  label: string
  className?: string
  onSuccess?: (subscriptionId: string) => void
}

export function CheckoutButton({ plan, label, className, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Could not start checkout')
        return
      }

      await loadScript('https://checkout.razorpay.com/v1/checkout.js')

      const rzp = new window.Razorpay({
        key:             data.key_id,
        subscription_id: data.subscription_id,
        name:            'Adnexusone',
        description:     plan === 'ai' ? 'AI Add-on' : `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
        image:           '/icon.svg',
        prefill: {
          name:    data.user_name,
          email:   data.user_email,
          contact: data.user_phone,
        },
        theme:   { color: '#7c3aed' },
        modal:   { backdropclose: false },
        handler: (response: { razorpay_subscription_id?: string }) => {
          toast.success('Payment successful! Activating your plan…')
          const subId = response?.razorpay_subscription_id ?? data.subscription_id
          if (onSuccess) {
            onSuccess(subId)
          } else {
            setTimeout(() => window.location.reload(), 2500)
          }
        },
      })

      rzp.on('payment.failed', (response: { error: { description: string } }) => {
        toast.error(response?.error?.description ?? 'Payment failed')
      })

      rzp.open()
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? 'Loading…' : label}
    </button>
  )
}
