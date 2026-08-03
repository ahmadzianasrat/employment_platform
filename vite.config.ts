import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // NOTE: GitHub Pages project sites serve from a subfolder
  // (github.io/REPO_NAME/), not the domain root — this must match that.
  // Once the custom domain is connected (which serves from root), change
  // this back to '/'. The React Router basename in App.tsx reads this
  // automatically via import.meta.env.BASE_URL, so that's the only line
  // that needs to change.
  base: '/employment_platform/',
})