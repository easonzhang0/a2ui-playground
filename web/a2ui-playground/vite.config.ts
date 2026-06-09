import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@a2ui/react': path.resolve(__dirname, '../../packages/a2ui-react/src'),
      '@a2ui/core': path.resolve(__dirname, '../../packages/a2ui-core/src')
    }
  }
})
