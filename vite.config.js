import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'  // ✅ this, not '@tailwindcss/tailwind'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})