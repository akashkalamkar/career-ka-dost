import { GOOGLE_REVIEWS } from '../config/testimonials'
import { SITE } from '../config/site'
import { container } from '../config/ui'
import { ReviewButton } from './ReviewButton'
import { SectionHeading } from './SectionHeading'
import { StarIcon } from './icons'

/**
 * "Google reviews": public reviews from the Google Business Profile, as simple review cards that move slowly from
 * left to right (stops under the mouse, and for visitors who prefer less motion). Data: GOOGLE_REVIEWS in
 * src/config/testimonials.js. These are not testimonials; they sit in their own section, after the testimonials.
 */
function Card({ r }) {
  return (
    <article className="mr-6 flex w-[300px] shrink-0 flex-col border border-line border-t-4 border-t-brand bg-white p-6 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand font-display text-lg font-extrabold" aria-hidden>
          {r.name.charAt(0)}
        </span>
        <div>
          <p className="font-display text-base font-extrabold leading-tight">{r.name}</p>
          <p className="text-xs font-semibold text-mute">Google review</p>
        </div>
      </div>
      <span className="mt-4 flex gap-0.5 text-brand" role="img" aria-label={`${r.rating} out of 5 stars`}>
        {Array.from({ length: r.rating }, (_, i) => (
          <StarIcon key={i} className="h-4 w-4" />
        ))}
      </span>
      <blockquote className="mt-3 flex-1 leading-relaxed text-ink-soft">&ldquo;{r.quote}&rdquo;</blockquote>
    </article>
  )
}

export function GoogleReviews() {
  const seconds = Math.max(GOOGLE_REVIEWS.length * 9, 30)
  return (
    <section id="google-reviews" className="scroll-mt-20 py-20 md:py-28">
      <div className={container}>
        <SectionHeading
          eyebrow="Google reviews"
          title="What families write on Google."
          subtitle={`Public reviews from our Google profile, rated ${SITE.googleRating} from ${SITE.googleReviewCount} reviews.`}
        />
      </div>
      <div className="overflow-hidden motion-reduce:overflow-x-auto">
        <div className="ckd-marquee flex w-max items-stretch py-4" style={{ '--marquee-duration': `${seconds}s` }}>
          {GOOGLE_REVIEWS.map((r) => (
            <Card key={r.name} r={r} />
          ))}
          <div className="contents" aria-hidden>
            {GOOGLE_REVIEWS.map((r) => (
              <Card key={`copy-${r.name}`} r={r} />
            ))}
          </div>
        </div>
      </div>
      <div className={`${container} mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4`}>
        <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-brand decoration-2 underline-offset-4">
          Read all our reviews on Google
        </a>
        <ReviewButton />
      </div>
    </section>
  )
}
