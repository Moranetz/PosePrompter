import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Fast Refresh configuration
      fastRefresh: true,
      // Babel configuration for better compatibility
      babel: {
        plugins: [
          // Helps with circular dependency detection in development
          ...(process.env.NODE_ENV === 'development' ? [] : []),
        ],
      },
    }),
  ],
  
  // Allow VITE_ prefix for environment variables (Vite standard)
  envPrefix: 'VITE_',
  
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
    // Improve HMR stability
    hmr: {
      overlay: true,
    },
  },
  
  // Build optimizations
  build: {
    // Generate source maps for production debugging
    sourcemap: true,
    // Rollup options for better chunk handling
    rollupOptions: {
      output: {
        // Manual chunk splitting to prevent circular dependency issues
        manualChunks: {
          // Firebase SDK in its own chunk
          'firebase-vendor': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage',
            'firebase/analytics',
          ],
          // React ecosystem in its own chunk
          'react-vendor': [
            'react',
            'react-dom',
          ],
          // Animation libraries
          'animation-vendor': [
            'framer-motion',
          ],
        },
      },
    },
    // Improve minification
    minify: 'esbuild',
    target: 'es2020',
  },
  
  // Dependency pre-bundling optimization
  optimizeDeps: {
    // Include Firebase modules for pre-bundling
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'firebase/analytics',
      'react',
      'react-dom',
      'framer-motion',
      'lucide-react',
    ],
    // Force re-bundling when these change
    exclude: [],
    // Use esbuild for faster pre-bundling
    esbuildOptions: {
      target: 'es2020',
    },
  },
  
  // Resolve configuration
  resolve: {
    // Ensure proper module resolution order
    dedupe: [
      'react',
      'react-dom',
      'firebase',
    ],
  },
});
