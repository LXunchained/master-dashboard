import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    // base matches the GitHub repo name so assets load correctly on gh-pages
    base: '/master-dashboard/',
    server: {
        port: 5000
    }
})
