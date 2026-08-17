import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Allow access from other devices and the ngrok HTTPS URL.
    host: true,

    allowedHosts: [
      "vendetta-bagging-devotee.ngrok-free.dev",
    ],

    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },

      "/socket.io": {
        target: "http://localhost:5000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});