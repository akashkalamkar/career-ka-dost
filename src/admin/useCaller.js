import { useCallback } from 'react'
import { AuthError, call } from './api'

/** Runs a portal request and turns "log in again" errors into a sign-out. */
export function useCaller(token, onAuthError) {
  return useCallback(
    async (action, payload) => {
      try {
        return await call(action, payload, token)
      } catch (err) {
        if (err instanceof AuthError) onAuthError()
        throw err
      }
    },
    [token, onAuthError],
  )
}
