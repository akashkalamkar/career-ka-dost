import { IMAGES, IMAGE_FALLBACKS } from '../config/images'
import { SITE } from '../config/site'
import { openWhatsApp } from '../utils/whatsapp'
import { PosterImage } from './PosterImage'

const badges = [
  { title: 'Expert Guidance', desc: 'Seasoned admission experts' },
  { title: 'Personalized Counselling', desc: 'Plans built around you' },
  { title: 'Parent Support', desc: 'Families guided at every step' },
  { title: 'Transparent Process', desc: 'Clear choices, zero confusion' },
]

export function Hero() {
  const waIntro = `Hi ${SITE.name}, I'd like to book a free counselling session for NEET/JEE/career guidance.`

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-70" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-10 md:grid-cols-2 md:items-center md:gap-12 md:px-6 md:pb-20 md:pt-14">
        <div className="animate-fade-up">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent-400" />
            Trusted by students & parents across India
          </p>
          <h1 className="text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Confused About NEET or Engineering Admission?
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-slate-600 md:text-xl">
            Get expert counselling to choose the best college based on your marks, rank, budget and career goals.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#lead-form"
              className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 hover:shadow-xl active:scale-[0.98]"
            >
              Book Free Counselling
            </a>
            <button
              type="button"
              onClick={() =>
                openWhatsApp({
                  phoneE164: SITE.whatsappE164,
                  message: waIntro,
                })
              }
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand-600 bg-white px-6 py-3.5 text-base font-semibold text-brand-700 transition hover:bg-brand-50 active:scale-[0.98]"
            >
              <WhatsAppGlyph className="h-5 w-5" />
              WhatsApp Now
            </button>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {badges.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl bg-white/90 p-3 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-slate-900">{b.title}</p>
                <p className="mt-1 text-xs leading-snug text-slate-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="animate-fade-up animation-delay-100 relative mx-auto w-full max-w-md md:max-w-none">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-accent-300/40 blur-2xl md:h-40 md:w-40" aria-hidden />
          <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-brand-400/20 blur-2xl" aria-hidden />
          <div className="animate-float-slow relative overflow-hidden rounded-3xl shadow-2xl shadow-brand-900/15 ring-1 ring-slate-200/80">
            <PosterImage
              src={IMAGES.hero}
              fallback={IMAGE_FALLBACKS.hero}
              alt="Students focused on career success with Career Ka Dost"
              className="aspect-[4/5] w-full object-cover md:aspect-[5/6]"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent p-5 pt-24">
              <p className="text-sm font-semibold text-white">Your marks + our roadmap = confident admissions</p>
              <p className="mt-1 text-xs text-white/85">NEET • JEE • Engineering • Career DNA</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function WhatsAppGlyph({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
