'use client'

import { createContext, useContext } from 'react'

const CurrencyContext = createContext('$')

export function CurrencyProvider({
  symbol,
  children,
}: {
  symbol: string
  children: React.ReactNode
}) {
  return <CurrencyContext.Provider value={symbol}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): string {
  return useContext(CurrencyContext)
}
