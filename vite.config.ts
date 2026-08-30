import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defaultConfig } from 'vite'

export default defineConfig ({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            '/proxy/codeload': {
                target: 'https://codeload.github.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/proxy\/codeload/, ''),
            },
        },
    },
})