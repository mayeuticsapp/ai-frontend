import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react( ), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // Manteniamo questo per sicurezza
    strictPort: true,
    hmr: {
      clientPort: 443,
    },
    // Aggiungiamo esplicitamente l'host permesso come richiesto dall'errore
    allowedHosts: [
      'ai-frontend-iyvt.onrender.com'
    ]
  }
})
