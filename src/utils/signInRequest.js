/** Name of the browser event that opens the sign-in pop-up (components/SignIn.jsx). */
export const SIGN_IN_EVENT = 'ckd:sign-in'

/** Ask the visitor to sign in. `then` = the download to offer afterwards: { href, label, download, newTab }. */
export function requestSignIn({ reason, then }) {
  window.dispatchEvent(new CustomEvent(SIGN_IN_EVENT, { detail: { reason, then } }))
}
