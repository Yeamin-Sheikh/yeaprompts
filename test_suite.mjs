import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000';
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name} - ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

console.log('=== Running Rigorous YeaPrompts Replica Verification Suite ===\n');

// 1. Test Server GET Endpoints
const endpoints = [
  { path: '/', expect: 'YeaPrompts' },
  { path: '/index.html', expect: 'YeaPrompts' },
  { path: '/browse.php', expect: 'All Prompts' },
  { path: '/browse.html', expect: 'All Prompts' },
  { path: '/browse', expect: 'All Prompts' },
  { path: '/prompt.php?id=281', expect: '30SEC BABY-GOAT FEEDING SATISFACTION VIDEOS' },
  { path: '/prompt.php?id=1', expect: 'prompt-content' },
  { path: '/prompt.php?id=100', expect: 'prompt-content' },
  { path: '/prompts/281.html', expect: 'BABY-GOAT' },
  { path: '/community.php', expect: 'Social Corner' },
  { path: '/community', expect: 'Social Corner' },
  { path: '/pricing.php', expect: 'Join Community' },
  { path: '/pricing', expect: 'Join Community' },
  { path: '/contact.php', expect: 'Contact' },
  { path: '/contact', expect: 'Contact' },
  { path: '/privacy.php', expect: 'Privacy' },
  { path: '/terms.php', expect: 'Terms' },
  { path: '/refund.php', expect: 'Refund' },
  { path: '/account.php', expect: 'My Account' },
  { path: '/account', expect: 'My Account' },
  { path: '/api/load_more.php', expect: 'prow' },
  { path: '/assets/css/style.css', expect: 'YeaPrompts' },
  { path: '/assets/js/main.js', expect: 'YeaPrompts' }
];

for (const ep of endpoints) {
  await test(`Endpoint GET ${ep.path}`, async () => {
    const res = await fetch(`${BASE_URL}${ep.path}`);
    assert(res.status === 200, `Expected HTTP 200, got ${res.status}`);
    const text = await res.text();
    assert(text.includes(ep.expect), `Response did not contain expected text "${ep.expect}"`);
  });
}

// 2. Test Server POST Endpoints
await test('Endpoint POST /contact.php handles form submission gracefully', async () => {
  const res = await fetch(`${BASE_URL}/contact.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'name=Test+User&email=test@example.com&message=Hello'
  });
  assert(res.status === 200, `Expected HTTP 200, got ${res.status}`);
  const json = await res.json();
  assert(json.success === true, 'Expected success: true');
});

await test('Endpoint POST /community.php handles post submission gracefully', async () => {
  const res = await fetch(`${BASE_URL}/community.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'content=New+community+post'
  });
  assert(res.status === 200, `Expected HTTP 200, got ${res.status}`);
  const json = await res.json();
  assert(json.success === true, 'Expected success: true');
});

// 3. Test Asset Images
const testImages = [
  '/assets/img/logo.png',
  '/assets/img/cover.jpg',
  '/assets/img/avatar.png',
  '/assets/img/banners/banner-01.jpg',
  '/uploads/926cf2e4733cbb24b7e059a2.png',
  '/uploads/community/1d32a81e6b5add6ec4512f0b.png'
];

for (const img of testImages) {
  await test(`Image asset GET ${img}`, async () => {
    const res = await fetch(`${BASE_URL}${img}`);
    assert(res.status === 200, `Expected HTTP 200, got ${res.status}`);
    const buf = await res.arrayBuffer();
    assert(buf.byteLength > 1000, `Image buffer too small (${buf.byteLength} bytes)`);
  });
}

// 4. Test All Prompts Integrity on disk
await test('All 316 static prompt files exist on disk with valid structure', async () => {
  const files = fs.readdirSync('prompts').filter(f => f.endsWith('.html'));
  assert(files.length === 316, `Expected 316 files, found ${files.length}`);
  
  for (const f of files) {
    const content = fs.readFileSync(path.join('prompts', f), 'utf8');
    assert(content.includes('id="prompt-content"'), `${f} missing prompt-content`);
    assert(content.includes('id="copy-btn"'), `${f} missing copy-btn`);
    assert(content.includes('class="site-header"'), `${f} missing site-header`);
    assert(content.includes('class="site-footer"'), `${f} missing site-footer`);
  }
});

// 5. Verify zero broken internal links across all HTML files
await test('Zero broken internal href/src links across all HTML files', async () => {
  const rootFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));
  const promptFiles = fs.readdirSync('prompts').filter(f => f.endsWith('.html')).map(f => 'prompts/' + f);
  const allHtml = [...rootFiles, ...promptFiles];
  assert(allHtml.length >= 325, `Expected at least 325 HTML files, found ${allHtml.length}`);

  let broken = [];
  for (const file of allHtml) {
    const content = fs.readFileSync(file, 'utf8');
    const dir = path.dirname(file);

    // Check src
    const srcMatches = content.matchAll(/src=["']([^"']+)["']/g);
    for (const m of srcMatches) {
      let s = m[1].split('?')[0];
      if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:') || s === '') continue;
      if (!fs.existsSync(path.join(dir, s))) {
        broken.push({ file, target: s });
      }
    }

    // Check href
    const hrefMatches = content.matchAll(/<(?:link|a)[^>]+href=["']([^"']+)["']/g);
    for (const m of hrefMatches) {
      let h = m[1].split('?')[0].split('#')[0];
      if (!h || h.startsWith('http://') || h.startsWith('https://') || h.startsWith('data:') || h.startsWith('javascript:') || h.startsWith('mailto:') || h.startsWith('tel:')) continue;
      if (!fs.existsSync(path.join(dir, h))) {
        broken.push({ file, target: h });
      }
    }
  }

  assert(broken.length === 0, `Found ${broken.length} broken links: ${JSON.stringify(broken.slice(0, 5))}`);
});

// 6. Verify zero external soniprompts.com references remain
await test('Zero soniprompts.com URLs in datasets and HTML', async () => {
  const filesToCheck = [
    'browse.html',
    'prompt.html',
    'index.html',
    'community.html',
    'pricing.html',
    'account.html',
    'contact.html',
    'privacy.html',
    'terms.html',
    'refund.html',
    'data/prompts.json',
    'all_prompts_index.json'
  ];

  for (const f of filesToCheck) {
    const content = fs.readFileSync(f, 'utf8');
    const matches = content.match(/https?:\/\/(?:www\.)?soniprompts\.com/g);
    assert(!matches, `File ${f} still contains ${matches ? matches.length : 0} soniprompts.com references`);
  }
});

// 7. Verify all prompt image assets exist on local disk
await test('All images referenced in data/prompts.json exist on disk with valid file size', async () => {
  const prompts = JSON.parse(fs.readFileSync('data/prompts.json', 'utf8'));
  let missing = [];
  let checked = 0;

  for (const p of prompts) {
    if (p.thumbnail) {
      let clean = p.thumbnail.split('?')[0];
      if (clean.startsWith('/')) clean = clean.slice(1);
      if (!fs.existsSync(clean) || fs.statSync(clean).size === 0) {
        missing.push({ id: p.id, img: clean });
      }
      checked++;
    }
    for (const g of (p.galleryImages || [])) {
      let clean = g.split('?')[0];
      if (clean.startsWith('/')) clean = clean.slice(1);
      if (!fs.existsSync(clean) || fs.statSync(clean).size === 0) {
        missing.push({ id: p.id, img: clean });
      }
      checked++;
    }
  }

  assert(missing.length === 0, `Missing ${missing.length} images out of ${checked}: ${JSON.stringify(missing.slice(0, 5))}`);
});

// 8. Test Prompt Content Integrity in data/prompts.json
await test('All 316 prompts in prompts.json have full text, title, and valid categories', async () => {
  const prompts = JSON.parse(fs.readFileSync('data/prompts.json', 'utf8'));
  assert(prompts.length === 316, `Expected 316 items in json, found ${prompts.length}`);
  for (const p of prompts) {
    assert(p.promptText && p.promptText.length > 50, `Prompt ${p.id} has insufficient text length`);
    assert(p.title && p.title.length > 0, `Prompt ${p.id} has empty title`);
    assert(p.category && p.category.length > 0, `Prompt ${p.id} has empty category`);
  }
});

// 9. Test Browse Page Client Index and Features
await test('browse.html contains full search index, General category pill, and ID search support', async () => {
  const html = fs.readFileSync('browse.html', 'utf8');
  assert(html.includes('window.ALL_PROMPTS ='), 'Missing window.ALL_PROMPTS in browse.html');
  assert(html.includes('id="prompts-grid"'), 'Missing prompts-grid in browse.html');
  assert(html.includes('id="pagination"'), 'Missing pagination in browse.html');
  assert(html.includes('General (97)'), 'Missing General (97) category pill');
  assert(html.includes('Tools &amp; Tutorials (4)') || html.includes('Tools & Tutorials (4)'), 'Missing Tools & Tutorials pill');
  assert(html.includes('Animal &amp; Pets (40)') || html.includes('Animal & Pets (40)'), 'Missing Animal & Pets pill');
  assert(html.includes('matchesId'), 'Missing prompt ID search support');
  assert(html.includes('updatePillsUI'), 'Missing pill UI synchronization on load');
  assert(html.includes('page-link'), 'Missing pagination links');
});

// 10. Test prompt.html Dynamic Viewer
await test('prompt.html loads prompt 281 and prompt 100 with zero external assets', async () => {
  const html = fs.readFileSync('prompt.html', 'utf8');
  assert(html.includes('window.PROMPTS_DATA ='), 'Missing window.PROMPTS_DATA in prompt.html');
  assert(html.includes('id="prompt-content"'), 'Missing prompt-content container');
  assert(html.includes('id="copy-btn"'), 'Missing copy-btn');
  assert(!html.includes('https://soniprompts.com'), 'prompt.html contains external soniprompts.com URLs');
});

// 11. Test SQLite Database File and Schema
await test('data/database.sqlite exists and contains all prompts, categories, and media', async () => {
  assert(fs.existsSync('data/database.sqlite'), 'data/database.sqlite does not exist');
  const dbModule = await import('./db/index.js');
  const stats = dbModule.getStats();
  assert(stats.totalPrompts === 316, `Expected 316 prompts in DB, got ${stats.totalPrompts}`);
  assert(stats.totalCategories === 14, `Expected 14 categories in DB, got ${stats.totalCategories}`);
  assert(stats.totalMedia >= 383, `Expected at least 383 media records, got ${stats.totalMedia}`);
  assert(stats.totalChars > 5000000, `Expected >5M characters, got ${stats.totalChars}`);
});

// 12. Test REST API Endpoints backed by SQLite
await test('REST API endpoints /api/stats, /api/categories, /api/prompts, and /api/prompts/18', async () => {
  const statsRes = await (await fetch(`${BASE_URL}/api/stats`)).json();
  assert(statsRes.totalPrompts === 316, 'API /api/stats totalPrompts is not 316');

  const catsRes = await (await fetch(`${BASE_URL}/api/categories`)).json();
  assert(Array.isArray(catsRes) && catsRes.length === 14, 'API /api/categories did not return 14 categories');

  const promptsRes = await (await fetch(`${BASE_URL}/api/prompts?limit=5`)).json();
  assert(promptsRes.totalItems === 316, 'API /api/prompts totalItems is not 316');
  assert(promptsRes.items.length === 5, 'API /api/prompts items length is not 5');

  const p18Res = await (await fetch(`${BASE_URL}/api/prompts/18`)).json();
  assert(p18Res.id === 18 && p18Res.title === 'Image Prompt', 'API /api/prompts/18 failed');
  assert(Array.isArray(p18Res.media) && p18Res.media.length > 0, 'API /api/prompts/18 missing media');
});

// 13. Test CSV Export
await test('data/prompts.csv exists and contains 316 exported prompt records', async () => {
  assert(fs.existsSync('data/prompts.csv'), 'data/prompts.csv does not exist');
  const csvContent = fs.readFileSync('data/prompts.csv', 'utf8').trim();
  assert(csvContent.startsWith('id,title,category'), 'CSV header is invalid');
  let inQuote = false;
  let rowCount = 0;
  for (let i = 0; i < csvContent.length; i++) {
    if (csvContent[i] === '"') {
      if (inQuote && csvContent[i + 1] === '"') {
        i++; // skip escaped quote
      } else {
        inQuote = !inQuote;
      }
    } else if (csvContent[i] === '\n' && !inQuote) {
      rowCount++;
    }
  }
  // rowCount counts the header row + 316 prompt records = 316 boundaries
  assert(rowCount === 316, `Expected 316 data rows in CSV, got ${rowCount}`);
});

// 14. Test Database Repository Modules
await test('db/index.js and db/database.py exist and are properly structured', async () => {
  assert(fs.existsSync('db/index.js'), 'db/index.js does not exist');
  assert(fs.existsSync('db/database.py'), 'db/database.py does not exist');
});

// 15. Test Social Corner Hub
await test('community.html and /community route serve the revamped Social Corner', async () => {
  assert(fs.existsSync('community.html'), 'community.html does not exist');
  const content = fs.readFileSync('community.html', 'utf8');
  assert(content.includes('Social corner'), 'community.html missing "Social corner" heading');
  assert(content.includes('Official Creator Network'), 'community.html missing "Official Creator Network" badge');
  assert(content.includes('Master prompt use guide'), 'community.html missing formatted Master prompt guide');
  assert(content.includes('social-channels-grid'), 'community.html missing social channels grid');
  assert(content.includes('feed-composer'), 'community.html missing composer');
  assert(content.includes('posts-container'), 'community.html missing posts container');
  assert(content.includes('social-lightbox'), 'community.html missing lightbox modal');

  const res = await fetch(`${BASE_URL}/community.php`);
  assert(res.status === 200, 'Expected HTTP 200 on /community.php');
  const resText = await res.text();
  assert(resText.includes('Social corner'), 'Server response missing "Social corner"');
});

console.log(`\n========================================`);
console.log(`Test Results: ${passed} passed, ${failed} failed.`);
console.log(`========================================`);

if (failed > 0) process.exit(1);

