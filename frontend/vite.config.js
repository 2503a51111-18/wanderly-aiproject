
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-leaflet", "@react-leaflet/core"],
  },
  server: {
    port: 5174,
    strictPort: true,
  },
});
