import { useSyncExternalStore } from 'react'
import { SITE } from '../config/site'

/**
 * "Sign in with Google" for students (Firebase Authentication). Used by the checklists (ticks are saved to
 * the student's own account) and by the download buttons (Free resources, Daily notice), which ask the
 * visitor to sign in first. Viewing never needs signing in.
 *
 * The Firebase library is big, so it is loaded only when it is needed: when a sign-in box opens, on a
 * checklist page, or a moment after the page opens for someone who signed in before on this browser.
 * While SITE.firebaseWeb.apiKey is empty, sign-in is off and nothing here does anything.
 */

const CFG = SITE.firebaseWeb || {}
const FAKE = Boolean(import.meta.env.VITE_FAKE_AUTH) // test builds only (scripts/portal-tests): a pretend Google account

export const signInEnabled = FAKE || Boolean(CFG.apiKey && CFG.appId)

const HINT_KEY = 'ckd_signed_in' // "this browser was signed in last time", so we check early

const SERVER_STATE = Object.freeze({ known: false, loading: false, user: null })
let state = signInEnabled ? { known: false, loading: false, user: null } : { known: true, loading: false, user: null }
const listeners = new Set()

function setState(next) {
  state = { ...state, ...next }
  listeners.forEach((fn) => fn())
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function rememberHint(signedIn) {
  try {
    if (signedIn) localStorage.setItem(HINT_KEY, '1')
    else localStorage.removeItem(HINT_KEY)
  } catch {
    /* private window */
  }
}

let api = null // set once the library has loaded: { signIn, signOut, token }
let loading = null

/** Load the sign-in library (once). Resolves to the sign-in functions, or null when sign-in is off. */
export function prepareSignIn() {
  if (!signInEnabled || typeof window === 'undefined') return Promise.resolve(null)
  if (!loading) {
    setState({ loading: true })
    // The pretend account is only in test builds; in the real website this line keeps only Google sign-in.
    loading = (import.meta.env.VITE_FAKE_AUTH ? import('./fakeAuth') : import('./firebaseAuth'))
      .then((m) =>
        m.start(CFG, (user) => {
          rememberHint(Boolean(user))
          setState({ known: true, loading: false, user: user ? { uid: user.uid, name: user.displayName || '', email: user.email || '', photo: user.photoURL || '' } : null })
        }),
      )
      .then((loaded) => {
        api = loaded
        return loaded
      })
      .catch(() => {
        loading = null
        setState({ known: true, loading: false, user: null })
        return null
      })
  }
  return loading
}

// Someone who signed in before on this browser: check quietly a moment after the page opens.
function wasSignedIn() {
  try {
    return localStorage.getItem(HINT_KEY) === '1'
  } catch {
    return false
  }
}
if (signInEnabled && typeof window !== 'undefined') {
  if (wasSignedIn()) setTimeout(prepareSignIn, 1200)
  else state = { known: true, loading: false, user: null }
}

/** True once the library is loaded, so a click can open Google's window straight away (no pop-up blocker). */
export const signInReady = () => Boolean(api)

/**
 * Opens Google's sign-in window. Call it straight from a click, after prepareSignIn() has finished
 * (signInReady() is true) - waiting for anything first makes browsers block the window.
 * Resolves when signed in; rejects with an Error whose `code` explains why not.
 */
export function signInWithGoogle() {
  if (!api) return Promise.reject(Object.assign(new Error('not-ready'), { code: 'not-ready' }))
  return api.signIn()
}

export function signOutStudent() {
  rememberHint(false)
  return api ? api.signOut() : Promise.resolve()
}

/** A short-lived pass that proves to the database who is signed in. */
export function idToken() {
  return api ? api.token() : Promise.resolve(null)
}

/** { known, loading, user } - user is { uid, name, email, photo } or null. Re-renders on change. */
export function useAuth() {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE)
}

/** Plain-English message for a failed sign-in. */
export function signInError(err) {
  const code = (err && err.code) || ''
  if (code.includes('popup-closed') || code.includes('cancelled-popup')) return 'The Google window was closed before signing in. Please try again.'
  if (code.includes('popup-blocked')) return 'Your browser blocked the Google window. Please allow pop-ups for this website and try again.'
  if (code.includes('network')) return 'No internet connection. Please check your connection and try again.'
  if (code.includes('unauthorized-domain') || code.includes('operation-not-allowed')) return 'Sign-in is not switched on for this website yet. Please try again later.'
  if (code.includes('web-storage') || code.includes('disallowed') || code.includes('user-agent')) return 'Sign-in does not work inside this app. Open this page in Chrome or Safari and try again.'
  return 'Could not sign in just now. Please try again in a minute.'
}

/** Inside Instagram, Facebook and similar apps Google refuses to sign people in - we say so up front. */
export function inAppBrowser() {
  if (typeof navigator === 'undefined') return false
  return /Instagram|FBAN|FBAV|FB_IAB|Line\/|Snapchat|; wv\)/i.test(navigator.userAgent)
}
