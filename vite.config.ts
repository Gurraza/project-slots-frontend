import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Fix för __dirname i ESM-miljö
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                clash: resolve(__dirname, 'games/clashofreels/index.html'),
                lines: resolve(__dirname, 'games/lines/index.html'),
                neon: resolve(__dirname, 'games/neoncity/index.html'),
            },
        },
    },
    publicDir: 'public',
});