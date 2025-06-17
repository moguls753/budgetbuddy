import { defineConfig } from "vite"
import Ruby from "vite-plugin-ruby"
import Vue from "@vitejs/plugin-vue"
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from "node:url"

export default defineConfig({
  plugins: [
    Ruby(),
    Vue(),
  ],
  css: {
    postcss: './postcss.config.cjs',  // Add this
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./app/frontend", import.meta.url)),
    },
  },
})
