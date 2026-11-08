import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    // Faster filesystem stat & lookup on Windows
    fs: {
      cachedChecks: true
    },
    // Pre-transform core entry modules so initial page load is instantaneous
    warmup: {
      clientFiles: [
        './src/main.jsx',
        './src/App.jsx',
        './src/styles/index.css'
      ]
    }
  },
  // Pre-bundle heavy dependencies to eliminate hundreds of on-the-fly ESM requests
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      'three',
      '@supabase/supabase-js'
    ],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-three': ['three'],
          'vendor-icons': ['lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 1200
  }
});

