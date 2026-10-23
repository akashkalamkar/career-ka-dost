/**
 * @param {{
 *   eyebrow?: string
 *   title: string
 *   subtitle?: string
 *   variant?: 'light' | 'dark'
 *   art?: import('react').ReactNode   // optional 3D illustration shown to the right on large screens
 * }} props
 */
export function SectionHeading({ eyebrow, title, subtitle, variant = 'light', art }) {
  const isDark = variant === 'dark'

  return (
    <div className={`mb-12 md:mb-16 ${art ? 'flex items-center justify-between gap-12' : ''}`}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p
            className={`mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] ${isDark ? 'text-brand' : 'text-ink'}`}
          >
            <span className="h-1 w-8 bg-brand" aria-hidden />
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={`text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-tight md:text-5xl ${isDark ? 'text-white' : 'text-ink'}`}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className={`mt-5 text-pretty text-lg leading-relaxed ${isDark ? 'text-white/70' : 'text-ink-soft'}`}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {art ? <div className="hidden w-64 shrink-0 lg:block xl:w-72">{art}</div> : null}
    </div>
  )
}
