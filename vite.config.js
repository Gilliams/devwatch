import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base './' : fonctionne sur GitHub Pages quel que soit le nom du repo
export default defineConfig({
  base: './',
  plugins: [vue()],
})
