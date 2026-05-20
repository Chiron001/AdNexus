'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

const PLAN_LABELS: Record<string, { label: string; price: string; color: string }> = {
  growth: { label: 'Growth', price: '₹2,999/mo', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  agency: { label: 'Agency', price: '₹9,999/mo', color: 'bg-purple-50 border-purple-200 text-purple-800' },
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') ?? 'free'
  const planMeta = PLAN_LABELS[plan]

  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        company_name: companyName || null,
        plan: 'free',
      })
    }

    if (plan !== 'free' && planMeta) {
      try {
        const res = await fetch('/api/subscriptions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        })
        const json = await res.json()
        if (json.payment_link) {
          window.location.href = json.payment_link
          return
        }
      } catch {
        // fall through to dashboard if payment link fails
      }
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AdNexus</h1>
          <p className="text-gray-500 mt-1">AI-powered ad account diagnostics</p>
        </div>

        {planMeta && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border mb-4 text-sm font-medium ${planMeta.color}`}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            You&apos;re signing up for the <strong>{planMeta.label} plan</strong> — {planMeta.price}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>
              {planMeta
                ? `Create your account and complete payment to activate ${planMeta.label}`
                : 'Start diagnosing your ad accounts in 2 minutes'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">
                  Company name <span className="text-gray-400">(optional)</span>
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Your Brand / Agency"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? planMeta ? 'Creating account & preparing payment…' : 'Creating account…'
                  : planMeta ? `Create account & pay ${planMeta.price}` : 'Create account'}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-4">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
