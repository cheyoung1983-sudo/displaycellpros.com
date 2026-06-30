import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    optimizeDeps: {
      include: ['react-is', 'recharts'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      outDir: 'dist',
      minify: 'esbuild',
      cssMinify: true,
      cssCodeSplit: true,
      assetsInlineLimit: 4096, // Inline assets under 4KB to save HTTP requests
      sourcemap: false, // Disable sourcemaps in production to conserve storage and reduce overhead
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) return 'firebase-vendor';
              if (id.includes('@google/genai')) return 'genai-vendor';
              if (id.includes('recharts')) return 'recharts-vendor';
              if (id.includes('jspdf')) return 'jspdf-vendor';
              if (id.includes('motion')) return 'motion-vendor';
              return 'vendor';
            }
          },
        },
      },
    },
    esbuild: {
      drop: ['console', 'debugger'], // Strip debug statements for performance and security
      legalComments: 'none', // Exclude licensing text block sizes from compiled assets
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
