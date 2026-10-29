import { createContext, useCallback, useContext } from 'react'
import HI from './hi'
import MR from './mr'

/**
 * Hindi and Marathi for the main public pages. Each dictionary maps the exact English text to its
 * translation. Anything missing simply shows in English, so a page can never come out blank.
 * `scripts/check-translations.mjs` lists any English text that has no translation yet.
 */
export const LANGS = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिंदी', short: 'हिं' },
  { code: 'mr', label: 'मराठी', short: 'मरा' },
]

export const DICTS = { hi: HI, mr: MR }

const STORAGE_KEY = 'ckd-lang'

export function savedLang() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'hi' || v === 'mr' ? v : 'en'
  } catch {
    return 'en'
  }
}

export function saveLang(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    /* private window: the choice just is not remembered */
  }
}

/** translate('hi', 'Hello {name}', { name: 'Riya' }) */
export function translate(lang, text, vars) {
  const dict = DICTS[lang]
  let out = dict && Object.prototype.hasOwnProperty.call(dict, text) ? dict[text] : text
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v))
  return out
}

export const LangContext = createContext({ lang: 'en', setLang: () => {} })

export function useLang() {
  return useContext(LangContext)
}

export function useT() {
  const { lang } = useLang()
  return useCallback((text, vars) => translate(lang, text, vars), [lang])
}
