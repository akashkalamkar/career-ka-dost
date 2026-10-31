import { SITE } from '../config/site'

/** Logo mark + wordmark, matching the Career Ka Dost logo. `tone="dark"` is for use on black backgrounds. */
export function Brand({ tone = 'light', size = 'md', showTagline = true }) {
  const big = size === 'lg'
  return (
    <span className="flex min-w-0 items-center gap-3">
      <img
        src={SITE.logoSmallUrl}
        width={160}
        height={178}
        alt=""
        decoding="async"
        className={`${big ? 'h-16' : 'h-12'} w-auto shrink-0 object-contain`}
      />
      <span className="flex flex-col">
        <span className={`whitespace-nowrap font-display font-extrabold leading-none tracking-tight ${big ? 'text-3xl' : 'text-xl'}`}>
          <span className={tone === 'dark' ? 'text-white' : 'text-ink'}>Career Ka </span>
          <span className="text-brand">Dost</span>
        </span>
        {showTagline ? (
          <span className={`mt-1 whitespace-nowrap font-bold uppercase tracking-[0.14em] ${tone === 'dark' ? 'text-white/80' : 'text-ink-soft'} ${big ? 'text-xs' : 'text-[0.62rem]'}`}>
            {SITE.tagline}
          </span>
        ) : null}
      </span>
    </span>
  )
}
