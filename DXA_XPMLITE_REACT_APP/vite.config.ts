import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap:false,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          var info = assetInfo.name!==undefined && assetInfo.name.split(".") as any
          var extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = "img";
          } else if (/woff|woff2/.test(extType)) {
            extType = "css";
          }
          return `content/xpmlite/${extType}/dxa-xpmlite-[hash][extname]`;
        },
        chunkFileNames: "content/xpmlite/js/dxa-xpmlite-[hash].js",
        entryFileNames: "content/xpmlite/js/dxa-xpmlite-[hash].js",
      },
    }
},
})
