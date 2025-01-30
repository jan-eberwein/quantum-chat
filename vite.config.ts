/// <reference types="node" />
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import tailwind from 'tailwindcss'
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    css: {
        postcss: {
            plugins: [tailwind(), autoprefixer()], // Ensure Tailwind PostCSS integration
        },
    },
    plugins: [vue()], // Vue plugin should be properly installed
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src/', import.meta.url)), // Ensure correct alias resolution
        },
    },
});
