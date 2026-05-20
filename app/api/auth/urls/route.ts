import { getMetaAuthUrl } from '@/lib/meta/auth'
import { getGoogleAuthUrl } from '@/lib/google/auth'
import { getAmazonAuthUrl } from '@/lib/amazon/auth'

export async function GET() {
  return Response.json({
    meta: getMetaAuthUrl(),
    google: getGoogleAuthUrl(),
    amazon: getAmazonAuthUrl(),
  })
}
