import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true, // Permite qualquer host em desenvolvimento
    port: 8080,
  },
  preview: {
    host: true, // Permite qualquer host em preview
    port: 3000, // Mesma porta do Dockerfile
    allowedHosts: [
      'gcm.nexgov.com.br',
      'gcmsentinela.nexgov.com.br', // Adicione o host que estava bloqueado
      '.nexgov.com.br', // Permite todos os subdomínios
      'localhost',
      '127.0.0.1',
    ],
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'], // Evita duplicação
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
    force: mode === 'development',
  },
  define: {
    global: 'globalThis',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser', // Usar terser como na outra aplicação
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    },
  }
}));