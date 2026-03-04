// src/store/index.js
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const store = createPinia()

// the persistence plugin reads JSON from localStorage.  If the data has been
// corrupted (e.g. a stray backslash or bad unicode escape) the parse will
// throw and bubble up as "Bad Unicode escape in JSON…" at startup.  Catch that
// early and wipe the bad entry so the app can continue working.
try {
  const snapshot = localStorage.getItem('pinia')
  if (snapshot) {
    JSON.parse(snapshot)
  }
} catch (e) {
  console.warn('persisted state is invalid, clearing storage to avoid parse errors', e)
  localStorage.removeItem('pinia')
}

store.use(piniaPluginPersistedstate)
export default store


