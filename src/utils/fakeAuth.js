/**
 * A pretend Google account, used only in test builds (VITE_FAKE_AUTH=1, see scripts/portal-tests). Never
 * part of the real website. Who is "signed in" is kept in this browser so a reload stays signed in, like
 * the real thing. `window.__ckdFakeUser` picks the account (a test can switch between two students).
 */
const KEY = 'ckd_fake_user'

export function start(_config, onUser) {
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || 'null')
    } catch {
      return null
    }
  }
  setTimeout(() => onUser(read()), 50)
  return {
    signIn: () =>
      new Promise((resolve) => {
        const user = window.__ckdFakeUser || { uid: 'student-a', displayName: 'Test Student', email: 'student.a@example.com', photoURL: '' }
        localStorage.setItem(KEY, JSON.stringify(user))
        setTimeout(() => {
          onUser(user)
          resolve(user)
        }, 50)
      }),
    signOut: () => {
      localStorage.removeItem(KEY)
      onUser(null)
      return Promise.resolve()
    },
    token: () => Promise.resolve(read() ? `fake-token-${read().uid}` : null),
  }
}
