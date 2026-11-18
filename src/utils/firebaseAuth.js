import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'

/** The real Google sign-in (Firebase Authentication). Loaded only when needed - see auth.js. */
export function start(config, onUser) {
  const app = initializeApp(config, 'students')
  const auth = getAuth(app)
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  onAuthStateChanged(auth, onUser)
  return {
    signIn: () => signInWithPopup(auth, provider),
    signOut: () => signOut(auth),
    token: () => (auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null)),
  }
}
