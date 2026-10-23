/** Shared class strings so buttons and fields look identical everywhere. */
export const container = 'mx-auto w-full max-w-6xl px-5 md:px-8'

/** Raised, pressable 3D buttons: they lift on hover and sink when pressed. */
const btn =
  'inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-150 hover:-translate-y-0.5 active:translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass'

/** Brand yellow: the main call to action. */
export const btnPrimary = `${btn} bg-brand text-ink shadow-[0_5px_0_0_#b97f00] hover:shadow-[0_7px_0_0_#b97f00] active:shadow-[0_1px_0_0_#b97f00]`
/** White with an amber edge: the second button, on yellow or white backgrounds. (Name kept; it is no longer black.) */
export const btnInk = `${btn} border-2 border-brand-deep bg-white text-ink shadow-[0_5px_0_0_#b97f00] hover:bg-[#ffd24d] hover:shadow-[0_7px_0_0_#b97f00] active:bg-[#ffd24d] active:shadow-[0_1px_0_0_#b97f00]`
export const btnOutline = `${btn} border-2 border-brand-deep text-ink shadow-[0_5px_0_0_#b97f00] hover:bg-brand hover:shadow-[0_7px_0_0_#b97f00] active:shadow-[0_1px_0_0_#b97f00]`
export const btnOutlineLight = `${btn} border border-white/50 text-white shadow-[0_5px_0_0_rgba(255,255,255,0.5)] hover:bg-white hover:text-ink active:shadow-[0_1px_0_0_rgba(255,255,255,0.5)]`

export const fieldLabel = 'block text-xs font-medium uppercase tracking-[0.14em] text-mute'
export const fieldInput =
  'mt-2 block w-full border-0 border-b border-ink/30 bg-transparent px-0 py-2.5 text-base text-ink outline-none transition placeholder:text-mute/60 focus:border-brand-deep focus:ring-0'
