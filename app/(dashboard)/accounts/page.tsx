import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getMetaAuthUrl } from '@/lib/meta/auth'
import { getGoogleAuthUrl } from '@/lib/google/auth'
import { getAmazonAuthUrl } from '@/lib/amazon/auth'
import { formatRelativeTime } from '@/lib/utils/format'
import { CheckCircle2, AlertCircle, RefreshCw, Unplug } from 'lucide-react'

const platformInfo = {
  meta: {
    name: 'Meta Ads',
    description: 'Facebook, Instagram & Audience Network campaigns',
    color: 'bg-blue-600',
    textColor: 'text-blue-600',
  },
  google: {
    name: 'Google Ads',
    description: 'Search, Shopping, Display & YouTube campaigns',
    color: 'bg-green-600',
    textColor: 'text-green-600',
  },
  amazon: {
    name: 'Amazon Ads',
    description: 'Sponsored Products, Brands & Display campaigns',
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
  },
}

export default async function AccountsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adAccounts } = await supabase
    .from('ad_accounts')
    .select('*')
    .eq('user_id', user.id)

  const connectedPlatforms = new Set(adAccounts?.map(a => a.platform) ?? [])

  const metaAuthUrl = getMetaAuthUrl()
  const googleAuthUrl = getGoogleAuthUrl()
  const amazonAuthUrl = getAmazonAuthUrl()

  const platformUrls = { meta: metaAuthUrl, google: googleAuthUrl, amazon: amazonAuthUrl }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Connected Accounts</h2>
        <p className="text-gray-500 mt-1">Connect your ad platforms to start getting diagnostics.</p>
      </div>

      {/* Connected accounts */}
      {adAccounts && adAccounts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-gray-700">Active Connections</h3>
          {adAccounts.map((account) => {
            const info = platformInfo[account.platform as keyof typeof platformInfo]
            return (
              <Card key={account.id}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${info.color} rounded-xl flex items-center justify-center text-white text-lg font-bold`}>
                        {account.platform.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{info.name}</p>
                        <p className="text-sm text-gray-500">{account.account_name || account.account_id}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {account.status === 'active' ? (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-red-600">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {account.status}
                            </span>
                          )}
                          {account.last_synced_at && (
                            <span className="text-xs text-gray-400">
                              · Last synced {formatRelativeTime(account.last_synced_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <form action={`/api/sync/${account.platform}`} method="POST">
                        <input type="hidden" name="account_id" value={account.id} />
                        <Button type="submit" variant="outline" size="sm" className="gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5" />
                          Sync Now
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Connect platforms */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-700">Connect a Platform</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.keys(platformInfo) as Array<keyof typeof platformInfo>).map((platform) => {
            const info = platformInfo[platform]
            const isConnected = connectedPlatforms.has(platform)

            return (
              <Card key={platform} className={isConnected ? 'opacity-60' : 'hover:shadow-md transition-shadow'}>
                <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
                  <div className={`w-16 h-16 ${info.color} rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4`}>
                    {platform.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{info.name}</h4>
                  <p className="text-xs text-gray-500 mb-5">{info.description}</p>
                  {isConnected ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Button asChild className="w-full">
                      <a href={platformUrls[platform]}>Connect {info.name}</a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
