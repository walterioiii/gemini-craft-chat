import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// __dirname is not defined in ESM modules, so resolve relative to process.cwd().
const srcPath = path.resolve(process.cwd(), 'src')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
})
