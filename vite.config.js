import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** GitHub project Pages use base `/repo-name/`; local dev uses `/`. Set `VITE_BASE_PATH` in CI. */
function viteBase() {
  const raw = process.env.VITE_BASE_PATH?.trim()
  if (!raw) {
    return '/'
  }
  const lead = raw.startsWith('/') ? raw : `/${raw}`
  return lead.endsWith('/') ? lead : `${lead}/`
}

export default defineConfig({
  base: viteBase(),
  plugins: [react(), tailwindcss()],
})
