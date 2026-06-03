import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// ตรวจว่ารันอยู่บน Replit หรือเปล่า
const isReplit = !!process.env.REPL_ID;

// PORT: ใช้สำหรับ dev server เท่านั้น — Vercel ไม่ต้องการ
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// BASE_PATH: Replit ตั้งเป็น /silicon-empire/ แต่ Vercel ใช้ /
const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    // Replit-only plugins — ข้ามเมื่อ build บน Vercel
    ...(isReplit
      ? [
          (await import("@replit/vite-plugin-runtime-error-modal")).default(),
          ...(process.env.NODE_ENV !== "production"
            ? [
                await import("@replit/vite-plugin-cartographer").then((m) =>
                  m.cartographer({
                    root: path.resolve(import.meta.dirname, ".."),
                  }),
                ),
                await import("@replit/vite-plugin-dev-banner").then((m) =>
                  m.devBanner(),
                ),
              ]
            : []),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    // dist (ไม่ใช่ dist/public) — ตรงกับ Vercel default output directory
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
