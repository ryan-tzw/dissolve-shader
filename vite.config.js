import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), glsl()],
    root: 'src/',
    publicDir: '../public/',
    base: './',
})
