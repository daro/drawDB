import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@data": path.resolve(__dirname, "./src/data"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@icons": path.resolve(__dirname, "./src/icons"),
      "@animations": path.resolve(__dirname, "./src/animations"),
      "@api": path.resolve(__dirname, "./src/api"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@context": path.resolve(__dirname, "./src/context"),
      "@i18n": path.resolve(__dirname, "./src/i18n"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@templates": path.resolve(__dirname, "./src/templates"),
    },
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
      interval: 500,
    },
  },
  plugins: [
    react(),
    visualizer({
      open: false, // Don't open automatically
      filename: "stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  build: {
    sourcemap: false,
    // Increase warning limit to 2MB
    chunkSizeWarningLimit: 2000,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Semi UI - large UI framework
            if (
              id.includes("@douyinfe/semi-ui") ||
              id.includes("@douyinfe/semi-icons")
            ) {
              return "ui-framework";
            }
            // Monaco Editor - large library
            if (id.includes("@monaco-editor") || id.includes("monaco-editor")) {
              return "monaco-editor";
            }
            // SQL parsers are huge, keep them separate
            if (
              id.includes("node-sql-parser") ||
              id.includes("oracle-sql-parser") ||
              id.includes("@dbml/core")
            ) {
              return "sql-parsers";
            }
            return "vendor";
          }
        },
        // Optimize file names
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },

    // Minification (esbuild is faster and built into Vite)
    minify: "esbuild",

    // esbuild options
    esbuild: {
      drop: ["console", "debugger"], // Remove console.log and debugger in production
    },
  },

  // Optimization for dev
  optimizeDeps: {
    include: ["react", "react-dom", "@douyinfe/semi-ui"],
  },
});
