import { SITE } from '../config/site'
import { trackEvent } from '../utils/analytics'
import { StarIcon } from './icons'

/** "Review us on Google": opens the Google Business Profile review box. Hidden until the link is set in site.js. */
export function ReviewButton({ className = '' }) {
  if (!SITE.googleReviewUrl) return null
  return (
    <a
      href={SITE.googleReviewUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('review_click')}
      className={`inline-flex items-center justify-center gap-2 border-2 border-brand-deep bg-white px-5 py-2.5 text-sm font-extrabold text-ink transition hover:-translate-y-0.5 hover:bg-brand ${className}`}
    >
      <StarIcon className="h-5 w-5 text-brand-deep" />
      Review us on Google
    </a>
  )
}
