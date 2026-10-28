// kleinster statischer Server für die lokale pixel-banner-Demo
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const types = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.js': 'text/javascript', '.css': 'text/css' };
const port = Number(process.env.PORT) || 8931;

http.createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/docs/index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root)) { res.writeHead(403).end('403'); return; }
  try {
    const data = await readFile(f);
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(data);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('404 ' + p);
  }
}).listen(port, '127.0.0.1', () => console.log('pixel-banner demo -> http://127.0.0.1:' + port + '/'));
