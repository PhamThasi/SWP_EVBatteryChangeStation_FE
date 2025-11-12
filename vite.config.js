import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ["@babel/plugin-proposal-decorators", { legacy: true }],
          ["@babel/plugin-proposal-class-properties", { loose: true }],
        ],
      },
    }),
    tailwindcss(),
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@vietmap/vietmap-gl-js": "@vietmap/vietmap-gl-js/dist/vietmap-gl.js",
    },
  },

  optimizeDeps: {
    include: ["@vietmap/vietmap-gl-js"],
  },

  build: {
    commonjsOptions: {
      transformMixedEsModules: true, // cho phép build file CJS + ESM lẫn nhau
    },
  },

  // 
  server: {
    port: 3000, 
    proxy: {
      "/vietmap": {
        target: "https://maps.vietmap.vn",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/vietmap/, ""),
      },
    },
  },

  moduleResolution: "bundler",
});
