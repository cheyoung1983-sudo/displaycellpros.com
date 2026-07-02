import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
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
            if (!id.includes('node_modules')) return undefined;

            // Extract exact package name (handles scoped packages, e.g. @firebase/app)
            const segments = id.split('node_modules/').pop()!.split('/');
            const pkg = segments[0].startsWith('@')
              ? `${segments[0]}/${segments[1]}`
              : segments[0];

            // React ecosystem — keep together to prevent circular refs
            if (['react', 'react-dom', 'react-is', 'scheduler'].includes(pkg)) {
              return 'react-vendor';
            }
            // Firebase (SDK + sub-packages)
            if (pkg === 'firebase' || pkg.startsWith('@firebase')) {
              return 'firebase-vendor';
            }
            // Google Generative AI
            if (pkg === '@google/genai') return 'genai-vendor';
            // Recharts + its d3 dependencies
            if (
              pkg === 'recharts' ||
              pkg.startsWith('d3') ||
              pkg === 'internmap' ||
              pkg === 'robust-predicates' ||
              pkg === 'victory-vendor'
            ) {
              return 'recharts-vendor';
            }
            // jsPDF
            if (pkg === 'jspdf') return 'jspdf-vendor';
            // Lucide icons
            if (pkg === 'lucide-react') return 'lucide-vendor';
            // Motion / Framer Motion
            if (pkg === 'motion' || pkg === 'framer-motion') return 'motion-vendor';

            return 'vendor';
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
