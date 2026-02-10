import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
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
    sourcemap: true,
    // Increase warning limit to 1MB
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
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
