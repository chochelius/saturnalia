import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const PORT = Number(process.env.PORT) || 9002;
const HOST = process.env.HOST || '0.0.0.0';
const POCKETBASE_HOST = '127.0.0.1';
const POCKETBASE_PORT = 8090;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

// Estado del proceso de reconstrucción (rebuild)
let rebuildState = {
  status: 'idle', // 'idle' | 'building' | 'success' | 'error'
  startedAt: null,
  finishedAt: null,
  error: null,
};

/**
 * Proxy transparente hacia PocketBase (puerto 8090)
 */
function proxyToPocketBase(req, res) {
  const options = {
    hostname: POCKETBASE_HOST,
    port: POCKETBASE_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `${POCKETBASE_HOST}:${POCKETBASE_PORT}`,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Añadir CORS para desarrollo flexible
    const headers = { ...proxyRes.headers, 'Access-Control-Allow-Origin': '*' };
    res.writeHead(proxyRes.statusCode || 200, headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('PocketBase Proxy Error:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ error: 'PocketBase backend gateway error', details: err.message }));
  });

  req.pipe(proxyReq);
}

/**
 * Ejecutar reconstrucción del sitio estático en segundo plano
 */
function triggerRebuild() {
  if (rebuildState.status === 'building') {
    return { alreadyBuilding: true };
  }

  rebuildState = {
    status: 'building',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    error: null,
  };

  const nodePath = '/home/chochelius/.nvm/versions/node/v26.12.1/bin';
  const envPath = `${nodePath}:/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ''}`;

  console.log('🔄 Iniciando reconstrucción estática del sitio (npm run build)...');
  exec(
    'npm run build',
    {
      cwd: ROOT_DIR,
      env: { ...process.env, PATH: envPath, POCKETBASE_URL: `http://127.0.0.1:${POCKETBASE_PORT}` },
    },
    (err, stdout, stderr) => {
      rebuildState.finishedAt = new Date().toISOString();
      if (err) {
        console.error('❌ Error durante npm run build:', err.message);
        rebuildState.status = 'error';
        rebuildState.error = stderr || err.message;
      } else {
        console.log('✅ Reconstrucción estática completada con éxito.');
        rebuildState.status = 'success';
      }
    }
  );

  return { started: true };
}

const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // 1. Endpoint Rebuild API
  if (pathname === '/api/rebuild' && req.method === 'POST') {
    const result = triggerRebuild();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    return res.end(JSON.stringify({ success: true, ...result, ...rebuildState }));
  }

  // 2. Endpoint Rebuild Status
  if (pathname === '/api/rebuild/status' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    return res.end(JSON.stringify(rebuildState));
  }

  // 3. Proxy a PocketBase para API y Web UI (_/)
  if (pathname.startsWith('/api/') || pathname.startsWith('/_/') || pathname === '/_') {
    return proxyToPocketBase(req, res);
  }

  // 4. Servir archivos estáticos desde dist/
  let filePath = path.join(DIST_DIR, decodeURIComponent(pathname));

  // Si es un directorio, buscar index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath)) {
    // Soporte para URLs limpias (/links -> /links/index.html, /admin -> /admin/index.html)
    const withIndex = path.join(DIST_DIR, decodeURIComponent(pathname), 'index.html');
    const withHtml = path.join(DIST_DIR, decodeURIComponent(pathname) + '.html');
    if (fs.existsSync(withIndex)) {
      filePath = withIndex;
    } else if (fs.existsSync(withHtml)) {
      filePath = withHtml;
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // 404 Fallback
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Transmisión no encontrada');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Saturnalia999 Production Server escuchando en http://${HOST}:${PORT}`);
  console.log(`🔗 PocketBase Proxy activo en /api/* y /_/* -> http://${POCKETBASE_HOST}:${POCKETBASE_PORT}`);
});
