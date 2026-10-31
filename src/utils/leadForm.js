/** Name of the browser event that asks the booking pop-up to open. */
export const OPEN_LEAD_EVENT = 'ckd:open-lead'

export function openLeadForm() {
  window.dispatchEvent(new CustomEvent(OPEN_LEAD_EVENT))
}

/**
 * Spread onto a "Book counselling" link: it opens the same booking form as a pop-up.
 * The href still goes to the Contact page if scripts are blocked or the link is opened in a new tab.
 */
export const bookProps = {
  href: '/contact',
  onClick: (e) => {
    e.preventDefault()
    openLeadForm()
  },
}
