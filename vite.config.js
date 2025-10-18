  import path from "path";
  import tailwindcss from "@tailwindcss/vite";
  import react from "@vitejs/plugin-react";
  import { defineConfig } from "vite";

  // https://vite.dev/config/
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
      },
    },
  });