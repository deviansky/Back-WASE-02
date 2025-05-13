import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path"


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    proxy: {
      '/auth': {
        target: 'https://sadebackend-4yyydjdi1-dittas-projects.vercel.app',
        changeOrigin: true,  // Mengubah origin untuk permintaan
        secure: false,       // Gunakan jika server backend menggunakan HTTPS
        rewrite: (path) => path.replace(/^\/auth/, ''), // Sesuaikan URL API yang dipanggil
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
