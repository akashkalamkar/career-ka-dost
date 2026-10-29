import { LANGS, useLang, useT } from '../i18n'

/** English / हिंदी / मराठी buttons. Used in the strip above the header and inside the booking pop-up. */
export function LangButtons({ className = '' }) {
  const { lang, setLang } = useLang()
  const t = useT()
  return (
    <div className={`flex items-center gap-1 ${className}`} role="group" aria-label={t('Language')}>
      <span className="mr-1 text-xs font-semibold text-mute">{t('Language')}:</span>
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          aria-pressed={lang === l.code}
          onClick={() => setLang(l.code)}
          className={`rounded-full px-3 py-1 text-xs font-bold transition ${lang === l.code ? 'bg-brand text-ink' : 'text-ink-soft hover:bg-white hover:text-ink'}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
