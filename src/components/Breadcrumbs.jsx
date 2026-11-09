import { container } from '../config/ui'
import { crumbTrail } from '../seo'

/** "Home > Services & fees > MHT CET counselling": shows where the visitor is, and is the same trail Google reads. */
export function Breadcrumbs({ path }) {
  const trail = crumbTrail(path)
  if (trail.length < 2) return null
  return (
    <nav aria-label="Breadcrumb" className="border-b border-line bg-paper print:hidden">
      <ol className={`${container} flex flex-wrap items-center gap-x-2 gap-y-1 py-3 text-sm font-semibold text-ink-soft`}>
        {trail.map(([name, href], i) => {
          const last = i === trail.length - 1
          return (
            <li key={href} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-ink">
                  {name}
                </span>
              ) : (
                <a href={href} className="underline-offset-4 hover:text-ink hover:underline">
                  {name}
                </a>
              )}
              {last ? null : (
                <span aria-hidden className="text-mute">
                  &rsaquo;
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
