import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { Readable } from 'node:stream';

// Lokal ishlab chiqishda /api/chat so'rovlarini api/chat.js funksiyasiga yo'naltiradi,
// shunda `npm run dev` bilan ham AI ishlaydi (kalit .env faylidan olinadi).
function devApi() {
  return {
    name: 'sozlik-dev-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '');
      for (const k of ['ANTHROPIC_API_KEY', 'ANTHROPIC_MODEL']) {
        if (env[k] && !process.env[k]) process.env[k] = env[k];
      }
      server.middlewares.use('/api/chat', async (req, res) => {
        try {
          const chunks = [];
          for await (const c of req) chunks.push(c);
          const request = new Request('http://localhost/api/chat', {
            method: req.method,
            headers: { 'content-type': req.headers['content-type'] || 'application/json' },
            body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
          });
          const mod = await server.ssrLoadModule('/api/chat.js');
          const response = await mod.default(request);
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          if (response.body) Readable.fromWeb(response.body).pipe(res);
          else res.end();
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(e?.message || e) }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devApi()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/data/words/')) return 'words';
          if (id.includes('node_modules/framer-motion')) return 'motion';
          if (id.includes('node_modules/react')) return 'react';
        },
      },
    },
  },
});
