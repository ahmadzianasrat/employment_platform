import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // NOTE: this was '/employment_platform/' during interim testing on the
  // GitHub Pages project subfolder URL. Now that a custom domain is
  // connected (which serves from root), this is '/'. The React Router
  // basename in App.tsx follows this automatically via import.meta.env.BASE_URL.
  base: '/',
})
