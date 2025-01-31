/// <reference types="node" />
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import tailwind from 'tailwindcss';
import { defineConfig } from 'vite';

// Set correct base path for GitHub Pages
const repoName = 'quantum-chat';

export default defineConfig({
    base: `/${repoName}/`, // Ensures assets load correctly on GitHub Pages
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
    server: {
        host: '0.0.0.0', // Allows network access for testing
        port: 5173, // Default Vite port
    },
    build: {
        outDir: 'dist', // Output directory for production build
        sourcemap: true, // Enables better debugging
        chunkSizeWarningLimit: 500, // Prevents chunk size warnings
    },
});
