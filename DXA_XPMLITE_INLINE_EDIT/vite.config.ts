// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  build: {
    rolldownOptions: {
      output: {
        entryFileNames: 'dxa-inline-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0]?.endsWith('.css')) {
            return 'dxa-inline-[hash].css';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      mangle: true,
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    }
  }
});