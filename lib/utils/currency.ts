export const COUNTRY_CURRENCY: Record<string, { code: string; symbol: string }> = {
  IN: { code: 'INR', symbol: '₹' },
  US: { code: 'USD', symbol: '$' },
  GB: { code: 'GBP', symbol: '£' },
  AU: { code: 'AUD', symbol: 'A$' },
  CA: { code: 'CAD', symbol: 'C$' },
  SG: { code: 'SGD', symbol: 'S$' },
  AE: { code: 'AED', symbol: 'AED ' },
  DE: { code: 'EUR', symbol: '€' },
  FR: { code: 'EUR', symbol: '€' },
  NL: { code: 'EUR', symbol: '€' },
  ES: { code: 'EUR', symbol: '€' },
  IT: { code: 'EUR', symbol: '€' },
  PT: { code: 'EUR', symbol: '€' },
  BE: { code: 'EUR', symbol: '€' },
  AT: { code: 'EUR', symbol: '€' },
  CH: { code: 'CHF', symbol: 'Fr ' },
  SE: { code: 'SEK', symbol: 'kr ' },
  NO: { code: 'NOK', symbol: 'kr ' },
  DK: { code: 'DKK', symbol: 'kr ' },
  ZA: { code: 'ZAR', symbol: 'R ' },
  NG: { code: 'NGN', symbol: '₦' },
  KE: { code: 'KES', symbol: 'KSh ' },
  PH: { code: 'PHP', symbol: '₱' },
  ID: { code: 'IDR', symbol: 'Rp ' },
  MY: { code: 'MYR', symbol: 'RM ' },
  TH: { code: 'THB', symbol: '฿' },
  BR: { code: 'BRL', symbol: 'R$' },
  MX: { code: 'MXN', symbol: 'MX$' },
  JP: { code: 'JPY', symbol: '¥' },
  CN: { code: 'CNY', symbol: '¥' },
  KR: { code: 'KRW', symbol: '₩' },
  PK: { code: 'PKR', symbol: '₨' },
  BD: { code: 'BDT', symbol: '৳' },
  LK: { code: 'LKR', symbol: 'Rs ' },
  NP: { code: 'NPR', symbol: 'Rs ' },
}

export const COUNTRY_NAMES: Record<string, string> = {
  IN: 'India', US: 'United States', GB: 'United Kingdom',
  AU: 'Australia', CA: 'Canada', SG: 'Singapore',
  AE: 'UAE', DE: 'Germany', FR: 'France',
  NL: 'Netherlands', ES: 'Spain', IT: 'Italy',
  PT: 'Portugal', BE: 'Belgium', AT: 'Austria',
  CH: 'Switzerland', SE: 'Sweden', NO: 'Norway',
  DK: 'Denmark', ZA: 'South Africa', NG: 'Nigeria',
  KE: 'Kenya', PH: 'Philippines', ID: 'Indonesia',
  MY: 'Malaysia', TH: 'Thailand', BR: 'Brazil',
  MX: 'Mexico', JP: 'Japan', CN: 'China',
  KR: 'South Korea', PK: 'Pakistan', BD: 'Bangladesh',
  LK: 'Sri Lanka', NP: 'Nepal',
}

export function currencySymbol(country?: string | null): string {
  if (!country) return '$'
  return COUNTRY_CURRENCY[country]?.symbol ?? '$'
}

export function fmtMoney(v: number, sym = '$'): string {
  if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `${sym}${(v / 1_000).toFixed(0)}k`
  if (v > 0)          return `${sym}${Math.round(v)}`
  return `${sym}0`
}
