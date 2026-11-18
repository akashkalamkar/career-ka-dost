import { useEffect, useSyncExternalStore } from 'react'
import { SITE } from '../config/site'
import { idToken, useAuth } from './auth'

/**
 * Ticks on the free checklists. Everyone's ticks are kept on their own phone/computer (browser storage).
 * A student who signs in with Google also gets them saved to their account - in the Realtime Database at
 * progress/<their id>/<checklist id> - so they come back on any device. The database rules
 * (scripts/firebase-visit-counter-rules.json) let each student read and write only their own ticks.
 *
 * Ticks are a plain object of keys set to true, e.g. { "income-certificate": true, "rotational-dynamics_s": true }.
 * When a student signs in, ticks made on this device before signing in are moved into their account, so the
 * next student who uses the same phone starts with an empty list. After signing out the list is empty again.
 */

const DB = (import.meta.env.VITE_PROGRESS_DB_URL || SITE.visitCounterDbUrl || '').trim().replace(/\/+$/, '')
const EMPTY = Object.freeze({ ticks: Object.freeze({}), status: 'local' })
// Ticks made without signing in, and a copy of each signed-in student's ticks (shown at once next time).
const localKey = (listId, uid) => (uid ? `ckd-checklist-${listId}--${uid}` : `ckd-checklist-${listId}`)

function readLocal(listId, migrate, uid) {
  try {
    const raw = JSON.parse(window.localStorage.getItem(localKey(listId, uid)) || '{}')
    if (Array.isArray(raw)) return migrate ? migrate(raw) : {} // older format: list of ticked positions
    return raw && typeof raw === 'object' ? raw : {}
  } catch {
    return {}
  }
}

function writeLocal(listId, ticks, uid) {
  try {
    if (Object.keys(ticks).length) window.localStorage.setItem(localKey(listId, uid), JSON.stringify(ticks))
    else window.localStorage.removeItem(localKey(listId, uid))
  } catch {
    /* private window: ticks are just not remembered on this device */
  }
}

const cloudUrl = (uid, listId, token) => `${DB}/progress/${encodeURIComponent(uid)}/${listId}.json?auth=${encodeURIComponent(token)}`

async function readCloud(uid, listId) {
  const token = await idToken()
  if (!token) throw new Error('no-token')
  const res = await fetch(cloudUrl(uid, listId, token))
  if (!res.ok) throw new Error(`read ${res.status}`)
  const data = await res.json()
  return (data && data.t) || {}
}

async function writeCloud(uid, listId, ticks) {
  const token = await idToken()
  if (!token) throw new Error('no-token')
  // No ticks left: remove the saved list (the database does not keep empty lists).
  const res = Object.keys(ticks).length
    ? await fetch(cloudUrl(uid, listId, token), { method: 'PUT', body: JSON.stringify({ t: ticks, u: { '.sv': 'timestamp' } }) })
    : await fetch(cloudUrl(uid, listId, token), { method: 'DELETE' })
  if (!res.ok) throw new Error(`write ${res.status}`)
}

const clean = (ticks) => Object.fromEntries(Object.entries(ticks).filter(([, v]) => v === true))

const stores = new Map()

function storeFor(listId, migrate) {
  if (stores.has(listId)) return stores.get(listId)
  const listeners = new Set()
  let snap = null // filled on first read in the browser
  let uid = null // the signed-in student this list is attached to
  let saveTimer = null

  const emit = () => listeners.forEach((fn) => fn())
  const set = (next) => {
    snap = { ...snap, ...next }
    emit()
  }
  const get = () => {
    if (!snap) snap = { ticks: readLocal(listId, migrate), status: 'local' }
    return snap
  }

  function save(ticks) {
    writeLocal(listId, ticks, uid)
    if (!uid || !DB) return
    clearTimeout(saveTimer)
    set({ status: 'saving' })
    const forUid = uid
    saveTimer = setTimeout(() => {
      writeCloud(forUid, listId, ticks)
        .then(() => uid === forUid && set({ status: 'saved' }))
        .catch(() => uid === forUid && set({ status: 'error' }))
    }, 500)
  }

  const store = {
    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    get,
    toggle(key) {
      const ticks = { ...get().ticks }
      if (ticks[key]) delete ticks[key]
      else ticks[key] = true
      set({ ticks })
      save(ticks)
      return ticks
    },
    clear() {
      set({ ticks: {} })
      save({})
    },
    /** Called when the signed-in student changes (or signs out). */
    attach(user) {
      const nextUid = user ? user.uid : null
      if (nextUid === uid) return
      uid = nextUid
      clearTimeout(saveTimer)
      if (!uid || !DB) {
        // Signed out: start from this device's own ticks again.
        set({ ticks: readLocal(listId, migrate), status: 'local' })
        return
      }
      const forUid = uid
      const before = readLocal(listId, migrate) // ticked on this device before signing in
      set({ ticks: clean({ ...readLocal(listId, migrate, forUid), ...before }), status: 'loading' })
      readCloud(forUid, listId)
        .then((cloud) => {
          if (uid !== forUid) return
          const merged = clean({ ...cloud, ...before })
          const changed = Object.keys(merged).length !== Object.keys(clean(cloud)).length
          set({ ticks: merged, status: 'saved' })
          writeLocal(listId, merged, forUid)
          writeLocal(listId, {}) // moved into the account
          if (changed) save(merged)
        })
        .catch(() => uid === forUid && set({ status: 'error' }))
    },
  }
  stores.set(listId, store)
  return store
}

/**
 * Ticks for one checklist: { ticks, status, toggle(key), clear() }.
 * status: 'local' (this device only), 'loading', 'saving', 'saved' (in the student's account) or 'error'.
 * `migrate` turns the older saved format (a list of positions) into keys.
 */
export function useProgress(listId, migrate) {
  const store = storeFor(listId, migrate)
  const snap = useSyncExternalStore(store.subscribe, store.get, () => EMPTY)
  const { known, user } = useAuth()
  const uid = user ? user.uid : null
  useEffect(() => {
    if (known) store.attach(uid ? { uid } : null)
  }, [store, known, uid])
  return { ticks: snap.ticks, status: snap.status, toggle: store.toggle, clear: store.clear }
}
