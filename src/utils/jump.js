/**
 * Take the visitor to a page, and then to one particular thing on it (a question, a service, a download).
 * The page changes first; once it is on screen we scroll to the element and highlight it for a moment.
 */

import { currentPath, navigate } from './router'

export const SELECT_CLASS_EVENT = 'ckd:resources-class'

let pending = null

function flash(el) {
  if (el instanceof HTMLDetailsElement) el.open = true
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el.classList.add('ring-4', 'ring-brand', 'ring-offset-4', 'transition')
  window.setTimeout(() => el.classList.remove('ring-4', 'ring-brand', 'ring-offset-4'), 2200)
}

/** Called once the new page is on screen. */
export function applyPendingJump() {
  const jump = pending
  pending = null
  if (!jump) return
  if (jump.classId) window.dispatchEvent(new CustomEvent(SELECT_CLASS_EVENT, { detail: jump.classId }))
  if (!jump.anchor) return
  // Give the page a moment to draw (and the class tab to switch) before looking for the element.
  let tries = 0
  const look = () => {
    const el = document.getElementById(jump.anchor)
    if (el) flash(el)
    else if (tries++ < 12) window.setTimeout(look, 80)
  }
  window.setTimeout(look, 120)
}

export function jumpTo({ href, anchor, classId }) {
  pending = { anchor, classId }
  if (currentPath() === href) applyPendingJump()
  else navigate(href)
}
