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
    host: true, // Necessario per essere visibile all'esterno del container
    strictPort: true,
    hmr: {
      clientPort: 443, // Porta standard per le connessioni sicure (HTTPS)
    },
    // Rimuoviamo 'allowedHosts' perché 'host: true' dovrebbe già gestire questo.
    // Se l'errore persiste, lo reinseriremo. Proviamo prima la soluzione più pulita.
  }
})
