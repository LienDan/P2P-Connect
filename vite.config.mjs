import { defineConfig } from 'vite'

//adding base "./" because the exported file had trouble with build path
export default defineConfig({
  base: './'
})