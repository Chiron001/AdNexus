'use client'

import { useSyncExternalStore } from 'react'

/* Greeting by the viewer's local time — the server only knows UTC */
const noop = () => () => {}

export function Greeting({ name }: { name: string }) {
  const hour = useSyncExternalStore(noop, () => new Date().getHours(), () => -1)
  const hello = hour < 0 ? 'Welcome back' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  return <>{hello}{name ? `, ${name}` : ''}</>
}
