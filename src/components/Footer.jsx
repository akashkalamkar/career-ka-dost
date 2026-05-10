import { SITE } from '../config/site'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 py-12 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-3 md:px-6">
        <div>
          <p className="text-xl font-bold text-white">{SITE.name}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Expert NEET, JEE & career counselling—personalized, transparent, parent-friendly.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white">Contact</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              Phone:{' '}
              <a className="font-medium text-white hover:text-accent-300" href={`tel:${SITE.phoneTel}`}>
                {SITE.phoneDisplay}
              </a>
            </li>
            <li>
              WhatsApp:{' '}
              <a
                className="font-medium text-white hover:text-accent-300"
                href={`https://wa.me/${SITE.whatsappE164}`}
                target="_blank"
                rel="noreferrer"
              >
                Chat with us
              </a>
            </li>
            <li>
              Instagram:{' '}
              <a className="font-medium text-white hover:text-accent-300" href={SITE.instagramUrl} target="_blank" rel="noreferrer">
                Follow updates
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white">Visit</p>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">{SITE.addressLine}</p>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 px-4 pt-8 text-center text-xs text-slate-500 md:px-6">
        © {SITE.copyrightYear} {SITE.name}. All rights reserved.
      </div>
    </footer>
  )
}
