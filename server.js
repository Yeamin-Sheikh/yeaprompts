import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import * as dbRepo from './db/index.js';

const PORT = process.env.PORT || 3000;
const ROOT_DIR = process.cwd();

// Standard MIME type mapping for web assets
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=UTF-8'
};

const server = http.createServer((req, res) => {
  // Use modern WHATWG URL API to prevent DEP0169 deprecation warnings
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  let pathname = decodeURIComponent(reqUrl.pathname);

  // Handle POST requests gracefully (e.g. form submissions on contact and community pages)
  if (req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify({ success: true, message: 'Received successfully' }));
    return;
  }

  // Route aliases matching the exact 1:1 original live website
  if (pathname === '/' || pathname === '/index.php') {
    pathname = '/index.html';
  } else if (pathname === '/browse.php' || pathname === '/browse') {
    pathname = '/browse.html';
  } else if (pathname === '/prompt.php' || pathname === '/prompt') {
    const id = reqUrl.searchParams.get('id');
    if (id && fs.existsSync(path.join(ROOT_DIR, 'prompts', `${id}.html`))) {
      pathname = `/prompts/${id}.html`;
    } else {
      pathname = '/prompt.html';
    }
  } else if (pathname === '/community.php' || pathname === '/community') {
    pathname = '/community.html';
  } else if (pathname === '/pricing.php' || pathname === '/pricing') {
    pathname = '/pricing.html';
  } else if (pathname === '/contact.php' || pathname === '/contact') {
    pathname = '/contact.html';
  } else if (pathname === '/privacy.php' || pathname === '/privacy') {
    pathname = '/privacy.html';
  } else if (pathname === '/terms.php' || pathname === '/terms') {
    pathname = '/terms.html';
  } else if (pathname === '/refund.php' || pathname === '/refund') {
    pathname = '/refund.html';
  } else if (pathname === '/account.php' || pathname === '/account') {
    pathname = '/account.html';
  } else if (pathname === '/api/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify(dbRepo.getStats()));
    return;
  } else if (pathname === '/api/categories') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify(dbRepo.getCategories()));
    return;
  } else if (pathname === '/api/prompts') {
    const page = parseInt(reqUrl.searchParams.get('page') || reqUrl.searchParams.get('pg') || '1', 10);
    const limit = parseInt(reqUrl.searchParams.get('limit') || '15', 10);
    const category = reqUrl.searchParams.get('cat') || reqUrl.searchParams.get('category');
    const type = reqUrl.searchParams.get('type');
    const isFree = type === 'free' ? true : type === 'premium' ? false : null;
    const search = reqUrl.searchParams.get('q') || reqUrl.searchParams.get('search') || '';
    const sort = reqUrl.searchParams.get('sort') || 'newest';

    const result = dbRepo.getPrompts({ page, limit, category, isFree, search, sort });
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify(result));
    return;
  } else if (pathname.startsWith('/api/prompts/')) {
    const promptId = parseInt(pathname.replace('/api/prompts/', ''), 10);
    const item = dbRepo.getPromptById(promptId);
    if (!item) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify({ error: 'Prompt not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify(item));
    return;
  } else if (pathname === '/api/load_more.php') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    const loadMoreData = fs.readFileSync(path.join(ROOT_DIR, 'api', 'load_more_data.json'), 'utf8');
    res.end(loadMoreData);
    return;
  }

  // Prevent path traversal outside root
  const safePath = path.normalize(path.join(ROOT_DIR, pathname));
  if (!safePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If file not found directly, try appending .html
      const htmlTry = safePath + '.html';
      if (fs.existsSync(htmlTry)) {
        serveFile(htmlTry, res);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end(`<h1>404 Not Found</h1><p>The requested URL ${escapeHtml(pathname)} was not found on this local replica.</p><p><a href="/">Back to Home</a></p>`);
      return;
    }

    serveFile(safePath, res);
  });
});

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s]);
}

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const stream = fs.createReadStream(filePath);
  res.writeHead(200, { 'Content-Type': contentType });
  stream.pipe(res);
}

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`YeaPrompts Local Replica Server Running`);
  console.log(`Local Website:   http://localhost:${PORT}`);
  console.log(`Browse Prompts:  http://localhost:${PORT}/browse.php`);
  console.log(`Prompt Preview:  http://localhost:${PORT}/prompt.php?id=281`);
  console.log('====================================================');
});
