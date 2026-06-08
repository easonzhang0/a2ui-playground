import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@a2ui/react': '../../packages/a2ui-react/src',
      '@a2ui/core': '../../packages/a2ui-core/src'
    }
  }
})