/**
 * @param {{
 *   eyebrow?: string
 *   title: string
 *   subtitle?: string
 *   align?: 'left' | 'center'
 *   variant?: 'light' | 'dark'
 * }} props
 */
export function SectionHeading({ eyebrow, title, subtitle, align = 'center', variant = 'light' }) {
  const alignClass = align === 'center' ? 'text-center mx-auto max-w-3xl' : 'max-w-3xl'
  const isDark = variant === 'dark'

  return (
    <div className={`mb-10 md:mb-14 ${alignClass}`}>
      {eyebrow ? (
        <p
          className={`mb-2 text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-accent-300' : 'text-brand-600'}`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`text-balance text-3xl font-bold tracking-tight md:text-4xl ${isDark ? 'text-white' : 'text-slate-900'}`}
      >
        {title}
      </h2>
      {subtitle ? (
        <p className={`mt-4 text-pretty text-lg leading-relaxed ${isDark ? 'text-white/85' : 'text-slate-600'}`}>
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
