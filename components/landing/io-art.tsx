/* Insider One–style landscape art, recoloured to the AdNexus blue → violet.
   Pure SVG so it stays crisp and costs no image requests. */

export function Ridges({ className = '', glow = true, id = 'r' }: { className?: string; glow?: boolean; id?: string }) {
  return (
    <svg className={className} viewBox="0 0 1440 420" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-far`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6D5BFF" stopOpacity=".85" />
          <stop offset=".55" stopColor="#2A1F66" stopOpacity=".9" />
          <stop offset="1" stopColor="#0B0A14" />
        </linearGradient>
        <linearGradient id={`${id}-mid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3B5BFD" stopOpacity=".9" />
          <stop offset=".4" stopColor="#1A1747" />
          <stop offset="1" stopColor="#0B0A14" />
        </linearGradient>
        <linearGradient id={`${id}-near`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#241B4D" />
          <stop offset=".5" stopColor="#100E22" />
          <stop offset="1" stopColor="#0B0A14" />
        </linearGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8B7BFF" stopOpacity="0" />
          <stop offset=".35" stopColor="#B4A6FF" stopOpacity=".9" />
          <stop offset=".7" stopColor="#7FA2FF" stopOpacity=".8" />
          <stop offset="1" stopColor="#8B7BFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id}-far)`} d="M0 250 L120 205 L210 230 L330 150 L430 190 L540 120 L640 175 L760 95 L880 160 L990 130 L1100 185 L1210 140 L1330 190 L1440 160 L1440 420 L0 420Z" />
      <path fill={`url(#${id}-mid)`} d="M0 300 L90 260 L200 285 L300 225 L400 268 L520 205 L610 250 L700 230 L820 180 L930 245 L1040 215 L1150 260 L1260 220 L1360 255 L1440 235 L1440 420 L0 420Z" />
      {glow && <path fill="none" stroke={`url(#${id}-rim)`} strokeWidth="1.5" d="M0 300 L90 260 L200 285 L300 225 L400 268 L520 205 L610 250 L700 230 L820 180 L930 245 L1040 215 L1150 260 L1260 220 L1360 255 L1440 235" />}
      <path fill={`url(#${id}-near)`} d="M0 350 L140 315 L260 340 L380 300 L520 335 L660 305 L780 330 L900 295 L1040 335 L1180 310 L1300 338 L1440 315 L1440 420 L0 420Z" />
    </svg>
  )
}

/* Night sky glow used behind the hero and the CTA */
export function NightGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(70% 55% at 70% 85%, rgba(124,58,237,.55) 0%, transparent 60%), radial-gradient(60% 50% at 25% 95%, rgba(59,91,253,.45) 0%, transparent 60%), linear-gradient(180deg, #07060E 0%, #0B0A14 45%, #151036 100%)' }} />
      <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
    </div>
  )
}
