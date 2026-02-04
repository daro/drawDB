import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true, // Don't open automatically
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
    })
  ],

  build: {
    // Increase warning limit to 1MB
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // Split into smaller chunks
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React core libraries
            if (id.includes('react') || id.includes('react-dom') ||
                id.includes('react-router')) {
              return 'react-vendor';
            }

            // Monaco Editor - large library
            if (id.includes('@monaco-editor') || id.includes('monaco-editor')) {
              return 'monaco-editor';
            }

            // Semi UI - large component library
            if (id.includes('@douyinfe/semi-ui')) {
              return 'semi-ui';
            }

            // Semi Icons
            if (id.includes('@douyinfe/semi-icons')) {
              return 'semi-icons';
            }

            // Lexical editor
            if (id.includes('lexical') || id.includes('@lexical')) {
              return 'lexical-editor';
            }

            // SQL parsers
            if (id.includes('node-sql-parser') || id.includes('oracle-sql-parser') ||
                id.includes('@dbml/core')) {
              return 'sql-parsers';
            }

            // Export libraries (PDF, images, etc.)
            if (id.includes('jspdf') || id.includes('html-to-image') ||
                id.includes('html2canvas')) {
              return 'export-libs';
            }

            // Utilities (lodash, luxon, nanoid)
            if (id.includes('lodash') || id.includes('luxon') || id.includes('nanoid')) {
              return 'utilities';
            }

            // i18next
            if (id.includes('i18next')) {
              return 'i18n';
            }

            // Dexie
            if (id.includes('dexie')) {
              return 'dexie';
            }

            // Remaining node_modules as vendor
            return 'vendor';
          }
        },

        // Optimize file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      }
    },

    // Minification (esbuild is faster and built into Vite)
    minify: 'esbuild',

    // esbuild options
    esbuild: {
      drop: ['console', 'debugger'], // Remove console.log and debugger in production
    },
  },

  // Optimization for dev
  optimizeDeps: {
    include: ['react', 'react-dom', '@douyinfe/semi-ui'],
  },
});
