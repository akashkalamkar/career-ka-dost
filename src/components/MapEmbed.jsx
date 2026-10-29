import { useState } from 'react'
import { SITE } from '../config/site'
import { btnInk } from '../config/ui'
import { PinIcon } from './icons'
import { useT } from '../i18n'

/** Live, interactive Google Map of the office (drag, zoom, switch to satellite). */
export function MapEmbed() {
  const t = useT()
  const [loaded, setLoaded] = useState(false)

  return (
    <div>
      <div className="relative h-[22rem] border-t-4 border-brand bg-paper-2 md:h-[28rem]">
        {/* Shown until Google's map has loaded, so the area never looks blank */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink-soft">
          <span className="flex h-14 w-14 items-center justify-center bg-brand text-ink shadow-[0_4px_0_0_#b97f00]">
            <PinIcon className="h-7 w-7" />
          </span>
          <p className="font-semibold">{t('Loading map…')}</p>
          <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-ink underline decoration-brand decoration-2 underline-offset-4">
            {t('Or open it in Google Maps')}
          </a>
        </div>
        <iframe
          title={t('{site} on Google Maps', { site: SITE.name })}
          src={SITE.mapEmbedUrl}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      <div className="flex flex-col gap-4 border-t border-line bg-paper-2 p-6 text-ink md:flex-row md:items-center md:justify-between md:px-8">
        <p className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft">
          <PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
          {SITE.addressLine}
        </p>
        <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className={`${btnInk} shrink-0`}>
          {t('Get directions')}
        </a>
      </div>
    </div>
  )
}
