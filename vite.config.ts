import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        // Explicitly preserve the admin bearer token for local API calls.
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const authorization = req.headers.authorization;
            if (authorization) proxyReq.setHeader('authorization', authorization);
          });
        },
      },
    },
  },
})
