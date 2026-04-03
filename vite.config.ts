
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        // Proxy API requests to Backend
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false
        },
        // Proxy Socket.io
        '/socket.io': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          ws: true,
          secure: false
        },
        // Proxy PeerJS (WebRTC Signaling)
        '/peerjs': {
          target: 'http://localhost:9000', // PeerServer port
          changeOrigin: true,
          ws: true, // WebSockets for PeerJS
          secure: false,
          rewrite: (path) => path.replace(/^\/peerjs/, '') // Strip prefix if needed, though usually path matches
        }
      }
    },
    plugins: [
        react(), 
        basicSsl() // Generates self-signed cert
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.NODE_ENV': JSON.stringify(mode),
      'global': 'window',
    }
  };
});
