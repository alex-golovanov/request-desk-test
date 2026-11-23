import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { uiCopy } from "./src/copy.ts";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "request-desk-metadata",
      transformIndexHtml: (html) =>
        html
          .replace("__PAGE_TITLE__", uiCopy.product)
          .replace("__PAGE_DESCRIPTION__", uiCopy.description),
    },
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: {
    host: "127.0.0.1",
    port: Number(process.env.WEB_PORT ?? 5173),
    strictPort: true,
    proxy: {
      "/api": `http://127.0.0.1:${process.env.API_PORT ?? 3000}`,
    },
  },
});
