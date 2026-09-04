import fs from 'node:fs';
import path from 'node:path';

console.log('Loading prompts and pages data for modern site generation...');
const prompts = JSON.parse(fs.readFileSync('data/prompts.json', 'utf8'));
const otherPages = JSON.parse(fs.readFileSync('data/other_pages.json', 'utf8'));

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

if (!fs.existsSync('prompts')) fs.mkdirSync('prompts', { recursive: true });
if (!fs.existsSync('api')) fs.mkdirSync('api', { recursive: true });

// Precompute sanitized client array for browse.html
const allPromptsClientData = prompts.map(p => {
  let thumbRel = 'assets/img/cover.jpg';
  if (p.thumbnail) {
    let clean = p.thumbnail.split('?')[0];
    if (clean.startsWith('http')) {
      try {
        const u = new URL(clean);
        thumbRel = u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;
      } catch (e) {
        thumbRel = clean;
      }
    } else {
      thumbRel = clean.startsWith('/') ? clean.slice(1) : clean;
    }
  }
  return {
    id: p.id,
    title: p.title,
    category: p.category || 'General',
    thumbnail: thumbRel,
    badge: p.badge || (p.id % 20 === 0 ? 'FREE' : '🔒 Premium')
  };
});
const allPromptsJsonString = JSON.stringify(allPromptsClientData);

// Calculate accurate category counts
const categoryCounts = {};
allPromptsClientData.forEach(p => {
  const cat = p.category || 'General';
  categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
});
const sortedCategoryNames = Object.keys(categoryCounts).sort();

const categoryPillsHtml = [
  `<button type="button" onclick="window.setCategory('all')" class="cat-chip active" data-cat="all">All Categories (${prompts.length})</button>`,
  ...sortedCategoryNames.map(c => `<button type="button" onclick="window.setCategory('${escapeHtml(c)}')" class="cat-chip" data-cat="${escapeHtml(c)}">${escapeHtml(c)} (${categoryCounts[c]})</button>`)
].join('\n            ');

// Normalize full prompts data for prompt.html and prompts/{id}.html
const normalizedFullPrompts = prompts.map(p => {
  let thumbRel = 'assets/img/cover.jpg';
  if (p.thumbnail) {
    let clean = p.thumbnail.split('?')[0];
    if (clean.startsWith('http')) {
      try {
        const parsed = new URL(clean);
        thumbRel = parsed.pathname.startsWith('/') ? parsed.pathname.slice(1) : parsed.pathname;
      } catch (e) {
        thumbRel = clean;
      }
    } else {
      thumbRel = clean.startsWith('/') ? clean.slice(1) : clean;
    }
  }

  const localGallery = (p.galleryImages || []).map(img => {
    let clean = img.split('?')[0];
    if (clean.startsWith('http')) {
      try {
        const parsed = new URL(clean);
        return parsed.pathname.startsWith('/') ? parsed.pathname.slice(1) : parsed.pathname;
      } catch (e) {
        return clean;
      }
    }
    return clean.startsWith('/') ? clean.slice(1) : clean;
  });

  return {
    id: p.id,
    title: p.title,
    category: p.category || 'General',
    thumbnail: thumbRel,
    badge: p.badge || (p.id % 20 === 0 ? 'FREE' : '🔒 Premium'),
    href: `prompts/${p.id}.html`,
    updated: p.updated || 'Updated 02 Sep 2026',
    galleryImages: localGallery,
    promptText: p.promptText,
    promptLen: p.promptLen || (p.promptText ? p.promptText.length : 0),
    status: 200
  };
});
const fullPromptsJsonString = JSON.stringify(normalizedFullPrompts);

const commonHeaderHtml = (depth = '') => `
<header class="site-header">
    <div class="container header-inner">
        <a href="${depth}index.html" class="brand">
            <img src="${depth}assets/img/logo.png" alt="YeaPrompts Logo">
            <span>Yea<b>Prompts</b></span>
        </a>
        <div class="header-actions">
            <input type="checkbox" id="nav-toggle" class="nav-toggle-cb">
            <label for="nav-toggle" class="nav-toggle">☰</label>
            <nav class="main-nav">
                <a href="${depth}index.html">Home</a>
                <a href="${depth}browse.html">All Prompts</a>
                <a href="${depth}community.html">Social Corner</a>
                <a href="${depth}pricing.html">Join Community</a>
            </nav>
            <button type="button" class="theme-toggle-btn" onclick="window.toggleTheme()" aria-label="Toggle theme" title="Toggle theme">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            </button>
        </div>
    </div>
</header>
`;

const commonFooterHtml = (depth = '') => `
<footer class="site-footer">
    <div class="container footer-grid">
        <div class="f-left">
            <div class="footer-brand">
                <img src="${depth}assets/img/logo.png" alt="YeaPrompts Logo">
                <span>Yea<b>Prompts</b></span>
            </div>
            <p class="footer-tag">Viral AI video prompts for creators</p>
        </div>

        <nav class="footer-nav f-center">
            <a href="${depth}browse.html">All Prompts</a>
            <span class="footer-dot">·</span>
            <a href="${depth}community.html">Social Corner</a>
            <span class="footer-dot">·</span>
            <a href="${depth}pricing.html">Join Community</a>
            <span class="footer-dot">·</span>
            <a href="${depth}contact.html">Contact</a>
            <span class="footer-dot">·</span>
            <a href="${depth}privacy.html">Privacy</a>
            <span class="footer-dot">·</span>
            <a href="${depth}terms.html">Terms</a>
            <span class="footer-dot">·</span>
            <a href="${depth}refund.html">Refunds</a>
        </nav>

        <div class="f-right">
            <p class="follow-label">Follow us</p>
            <div class="social-row">
                <a href="https://www.facebook.com/som.soni.965" target="_blank" rel="noopener" class="social-ic" aria-label="Facebook">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.09 24 12.07z"/></svg>
                </a>
                <a href="https://whatsapp.com/channel/0029VbCl6nB002TFkWMBP43S" target="_blank" rel="noopener" class="social-ic" aria-label="WhatsApp Channel">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.1 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.79h-.01a9.72 9.72 0 0 1-4.96-1.36l-.36-.21-3.69.97.98-3.6-.23-.37a9.72 9.72 0 0 1-1.49-5.18c0-5.37 4.37-9.74 9.75-9.74a9.68 9.68 0 0 1 6.89 2.86 9.68 9.68 0 0 1 2.85 6.89c0 5.38-4.37 9.74-9.73 9.74zm8.28-18.02A11.64 11.64 0 0 0 12.05.33C5.6.33.35 5.58.35 12.03c0 2.06.54 4.07 1.56 5.84L.25 23.79l6.07-1.59a11.68 11.68 0 0 0 5.72 1.46h.01c6.45 0 11.7-5.25 11.7-11.7 0-3.13-1.22-6.07-3.42-8.19z"/></svg>
                </a>
            </div>
        </div>
    </div>
    <p class="footer-copy">© 2026 YeaPrompts</p>
</footer>
<a href="https://wa.me/919131421048?text=Hi%21+I%27m+a+premium+member+of+your+YeaPrompts+community.+I+need+some+help."
   target="_blank" rel="noopener" class="wa-float" title="WhatsApp Support">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.1 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.79h-.01a9.72 9.72 0 0 1-4.96-1.36l-.36-.21-3.69.97.98-3.6-.23-.37a9.72 9.72 0 0 1-1.49-5.18c0-5.37 4.37-9.74 9.75-9.74a9.68 9.68 0 0 1 6.89 2.86 9.68 9.68 0 0 1 2.85 6.89c0 5.38-4.37 9.74-9.73 9.74zm8.28-18.02A11.64 11.64 0 0 0 12.05.33C5.6.33.35 5.58.35 12.03c0 2.06.54 4.07 1.56 5.84L.25 23.79l6.07-1.59a11.68 11.68 0 0 0 5.72 1.46h.01c6.45 0 11.7-5.25 11.7-11.7 0-3.13-1.22-6.07-3.42-8.19z"/></svg>
    <span class="wa-float-label">Support</span>
</a>
`;

// ─── 1. Generate individual static prompt HTML files (prompts/{id}.html) ───
console.log(`Generating ${prompts.length} static prompt pages in prompts/...`);
for (let i = 0; i < normalizedFullPrompts.length; i++) {
  const p = normalizedFullPrompts[i];
  const prevPrompt = i > 0 ? normalizedFullPrompts[i - 1] : null;
  const nextPrompt = i < normalizedFullPrompts.length - 1 ? normalizedFullPrompts[i + 1] : null;

  let imagesToShow = [];
  if (p.galleryImages && p.galleryImages.length > 0) {
    imagesToShow = p.galleryImages;
  } else if (p.thumbnail && !p.thumbnail.includes('cover.jpg')) {
    imagesToShow = [p.thumbnail];
  }

  let galleryHtml = '';
  if (imagesToShow.length > 0) {
    const itemsHtml = imagesToShow.map(img => `
      <div style="text-align:center;">
        <img src="../${img}" alt="Storyboard image" onclick="window.openLightbox('../${img}')" loading="lazy">
        <a href="../${img}" download class="btn btn-sm btn-outline" style="margin-top:10px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download Reference
        </a>
      </div>
    `).join('\n');

    galleryHtml = `
      <h3 style="font-size:18px;margin-bottom:14px;">Storyboard & Reference</h3>
      <div class="prompt-gallery">
        ${itemsHtml}
      </div>
    `;
  }

  const promptWords = p.promptText ? p.promptText.trim().split(/\s+/).filter(Boolean).length.toLocaleString() : '0';
  const promptChars = p.promptText ? p.promptText.length.toLocaleString() : '0';

  const promptHtml = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(p.title)} - YeaPrompts</title>
<meta name="description" content="Viral AI video prompt: ${escapeHtml(p.title)}. Works with Seedance, Kling, Veo and any AI video tool.">
<link rel="icon" type="image/png" href="../assets/img/logo.png">
<link rel="stylesheet" href="../assets/css/style.css?v=25">
<script>
(function(){
  var t = localStorage.getItem('yeaprompts_theme') || localStorage.getItem('navprompts_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
})();
</script>
</head>
<body>
${commonHeaderHtml('../')}
<main>

<div class="prompt-single">
    <a href="../browse.html" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back to all prompts
    </a>

    <div class="prompt-head">
        <h1>${escapeHtml(p.title)}</h1>
        <div class="prompt-meta">
            <span>${escapeHtml(p.category || 'General')}</span>
            <span>ID: #${p.id}</span>
            <span>${promptWords} words</span>
            <span>${promptChars} chars</span>
            <span>${escapeHtml(p.updated || 'Updated 02 Sep 2026')}</span>
        </div>
    </div>

    ${galleryHtml}

    <div class="copy-bar">
        <button class="btn btn-primary" id="copy-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy Master Prompt
        </button>
    </div>
    <div class="prompt-content" id="prompt-content">${escapeHtml(p.promptText)}</div>

    <div class="prompt-nav-bar">
        ${prevPrompt ? `
        <a href="${prevPrompt.id}.html" class="prompt-nav-btn prev-btn" title="${escapeHtml(prevPrompt.title)}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            <div>
                <span class="nav-sub">Previous Prompt</span>
                <span class="nav-tit">#${prevPrompt.id} ${escapeHtml(prevPrompt.title.slice(0, 26))}</span>
            </div>
        </a>` : `<div></div>`}
        <a href="../browse.html" class="prompt-nav-grid" title="View all prompts">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>All Prompts</span>
        </a>
        ${nextPrompt ? `
        <a href="${nextPrompt.id}.html" class="prompt-nav-btn next-btn" title="${escapeHtml(nextPrompt.title)}">
            <div style="text-align:right;">
                <span class="nav-sub">Next Prompt</span>
                <span class="nav-tit">#${nextPrompt.id} ${escapeHtml(nextPrompt.title.slice(0, 26))}</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>` : `<div></div>`}
    </div>

</div>

</main>
${commonFooterHtml('../')}
<script src="../assets/js/main.js?v=25"></script>
</body>
</html>`;

  fs.writeFileSync(`prompts/${p.id}.html`, promptHtml, 'utf8');
}
console.log('Finished generating prompts/*.html pages.');

// ─── 2. Generate prompt.html (Dynamic viewer for ?id=XYZ) ───
const dynamicPromptHtml = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title id="page-title">Prompt Details - YeaPrompts</title>
<link rel="icon" type="image/png" href="assets/img/logo.png">
<link rel="stylesheet" href="assets/css/style.css?v=25">
<script>
(function(){
  var t = localStorage.getItem('yeaprompts_theme') || localStorage.getItem('navprompts_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
})();
</script>
</head>
<body>
${commonHeaderHtml('')}
<main>

<div class="prompt-single" id="prompt-container">
    <a href="browse.html" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back to all prompts
    </a>

    <div class="prompt-head">
        <h1 id="prompt-title">Loading prompt…</h1>
        <div class="prompt-meta" id="prompt-meta-container">
            <span id="prompt-cat">General</span>
            <span id="prompt-id">ID</span>
            <span id="prompt-words">Words</span>
            <span id="prompt-date">Updated</span>
        </div>
    </div>

    <div id="gallery-container"></div>

    <div class="copy-bar">
        <button class="btn btn-primary" id="copy-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy Master Prompt
        </button>
    </div>
    <div class="prompt-content" id="prompt-content"></div>

    <div class="prompt-nav-bar" id="dynamic-nav-bar"></div>
</div>

</main>
${commonFooterHtml('')}
<script>
window.PROMPTS_DATA = ${fullPromptsJsonString};
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = parseInt(urlParams.get('id'), 10) || 281;
  const idx = window.PROMPTS_DATA.findIndex(p => p.id === id);
  const prompt = idx !== -1 ? window.PROMPTS_DATA[idx] : window.PROMPTS_DATA[0];
  const curIdx = idx !== -1 ? idx : 0;
  const prevPrompt = curIdx > 0 ? window.PROMPTS_DATA[curIdx - 1] : null;
  const nextPrompt = curIdx < window.PROMPTS_DATA.length - 1 ? window.PROMPTS_DATA[curIdx + 1] : null;

  document.getElementById('page-title').textContent = prompt.title + ' - YeaPrompts';
  document.getElementById('prompt-title').textContent = prompt.title;
  document.getElementById('prompt-cat').textContent = prompt.category || 'General';
  document.getElementById('prompt-id').textContent = 'ID: #' + prompt.id;
  document.getElementById('prompt-date').textContent = prompt.updated || 'Updated 02 Sep 2026';
  document.getElementById('prompt-content').textContent = prompt.promptText;

  const words = prompt.promptText ? prompt.promptText.trim().split(/\\s+/).filter(Boolean).length.toLocaleString() : '0';
  document.getElementById('prompt-words').textContent = words + ' words';

  let imagesToShow = [];
  if (prompt.galleryImages && prompt.galleryImages.length > 0) {
    imagesToShow = prompt.galleryImages;
  } else if (prompt.thumbnail && !prompt.thumbnail.includes('cover.jpg')) {
    imagesToShow = [prompt.thumbnail];
  }

  if (imagesToShow.length > 0) {
    let gHtml = '<h3 style="font-size:18px;margin-bottom:14px;">Storyboard & Reference</h3><div class="prompt-gallery">';
    imagesToShow.forEach(img => {
      let rel = img.split('?')[0];
      if (rel.startsWith('/')) rel = rel.slice(1);
      gHtml += '<div style="text-align:center;">' +
               '<img src="' + rel + '" alt="Storyboard image" onclick="window.openLightbox(\\'' + rel + '\\')" loading="lazy">' +
               '<a href="' + rel + '" download class="btn btn-sm btn-outline" style="margin-top:10px;">' +
               '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Reference</a>' +
               '</div>';
    });
    gHtml += '</div>';
    document.getElementById('gallery-container').innerHTML = gHtml;
  }

  let navHtml = '';
  if (prevPrompt) {
    navHtml += '<a href="prompt.html?id=' + prevPrompt.id + '" class="prompt-nav-btn prev-btn" title="' + prevPrompt.title.replace(/"/g, '&quot;') + '">' +
               '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
               '<div><span class="nav-sub">Previous Prompt</span><span class="nav-tit">#' + prevPrompt.id + ' ' + prevPrompt.title.slice(0, 26) + '</span></div></a>';
  } else {
    navHtml += '<div></div>';
  }
  navHtml += '<a href="browse.html" class="prompt-nav-grid" title="View all prompts">' +
             '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>' +
             '<span>All Prompts</span></a>';
  if (nextPrompt) {
    navHtml += '<a href="prompt.html?id=' + nextPrompt.id + '" class="prompt-nav-btn next-btn" title="' + nextPrompt.title.replace(/"/g, '&quot;') + '">' +
               '<div style="text-align:right;"><span class="nav-sub">Next Prompt</span><span class="nav-tit">#' + nextPrompt.id + ' ' + nextPrompt.title.slice(0, 26) + '</span></div>' +
               '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"></polyline></svg></a>';
  } else {
    navHtml += '<div></div>';
  }
  document.getElementById('dynamic-nav-bar').innerHTML = navHtml;
})();
</script>
<script src="assets/js/main.js?v=25"></script>
</body>
</html>`;

fs.writeFileSync('prompt.html', dynamicPromptHtml, 'utf8');
console.log('Saved prompt.html (dynamic viewer).');


// ─── 3. Generate browse.html with full local interactive engine ───
const browseHtml = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Browse All Prompts - YeaPrompts</title>
<meta name="description" content="279 Viral AI video prompts for Facebook Reels, YouTube Shorts, Instagram and TikTok. Works with Seedance, Kling, Veo, Luma, and Runway.">
<link rel="icon" type="image/png" href="assets/img/logo.png">
<link rel="stylesheet" href="assets/css/style.css?v=25">
<script>
(function(){
  var t = localStorage.getItem('yeaprompts_theme') || localStorage.getItem('navprompts_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
})();
</script>
</head>
<body>
${commonHeaderHtml('')}
<main>

<div class="container" style="padding-top:10px;">

    <div class="catalog-hero">
        <h1>All Prompts</h1>
        <p>Explore 279 viral short-video prompts with complete continuity engines and storyboard references</p>
    </div>

    <div class="filter-control-panel">
        <div class="search-row">
            <div class="search-box-wrap">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" id="search-input" placeholder="Search by title, prompt ID (e.g. 18), or keyword..." autocomplete="off">
                <button type="button" id="search-clear" class="search-clear-btn" title="Clear search" onclick="window.clearSearch()">✕</button>
                <span class="search-hotkey-hint">/</span>
            </div>
            <select id="sort-select" class="sort-select" onchange="window.applyFilters()">
                <option value="new" selected>Newest First</option>
                <option value="old">Oldest First</option>
                <option value="az">Title A to Z</option>
                <option value="za">Title Z to A</option>
            </select>
        </div>

        <div class="type-filter-row">
            <div class="type-pills" id="type-pills">
                <button type="button" onclick="window.setType('all')" class="type-pill active" data-type="all">All Prompts (${prompts.length})</button>
                <button type="button" onclick="window.setType('free')" class="type-pill" data-type="free">Free Prompts (25)</button>
                <button type="button" onclick="window.setType('premium')" class="type-pill" data-type="premium">Premium Prompts (254)</button>
            </div>
            <div class="results-status-badge" id="results-count-badge">
                Showing <b>${prompts.length}</b> prompts
            </div>
        </div>

        <div class="category-chips-wrap" id="category-pills">
            ${categoryPillsHtml}
        </div>
    </div>

    <!-- Local Unlocked Banner -->
    <div class="mem-banner">
        <span><strong>Local Replica:</strong> Full creator access unlocked. All ${prompts.length} prompts, storyboards, and master engines are available offline.</span>
        <span class="status-pill">Active Unlocked</span>
    </div>

    <div class="grid" id="prompts-grid">
        <!-- Rendered instantly by client JS -->
    </div>

    <div class="pagination" id="pagination">
        <!-- Rendered by JS -->
    </div>

</div>

<!-- Quick View Modal Drawer -->
<div class="modal-backdrop" id="quick-view-modal" onclick="if(event.target===this) window.closeQuickView()">
    <div class="modal-dialog">
        <div class="modal-header">
            <div class="modal-title-wrap">
                <h2 class="modal-title" id="modal-prompt-title">Prompt Details</h2>
                <div class="modal-meta-row">
                    <span class="pcard-cat" id="modal-prompt-cat">General</span>
                    <span id="modal-prompt-date">Updated 02 Sep 2026</span>
                </div>
            </div>
            <button type="button" class="modal-close-btn" onclick="window.closeQuickView()" title="Close (Esc)">✕</button>
        </div>
        <div class="modal-body">
            <div class="modal-storyboard">
                <img id="modal-storyboard-img" src="" alt="Storyboard Reference" title="Click to enlarge">
            </div>
            <div class="modal-prompt-box-wrap">
                <div class="modal-prompt-header">
                    <span class="modal-prompt-label">Master Prompt Text</span>
                    <button type="button" class="btn btn-sm btn-primary" id="modal-copy-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        Copy Master Prompt
                    </button>
                </div>
                <pre class="modal-prompt-code" id="modal-prompt-code">Loading...</pre>
            </div>
        </div>
        <div class="modal-footer">
            <div class="modal-shortcuts-hint">
                <kbd>Esc</kbd> Close &nbsp;•&nbsp; <kbd>←</kbd> <kbd>→</kbd> Navigate &nbsp;•&nbsp; <kbd>/</kbd> Search
            </div>
            <div class="modal-nav-group">
                <button type="button" class="btn btn-sm btn-outline" onclick="window.navigateQuickView(-1)">← Previous</button>
                <button type="button" class="btn btn-sm btn-outline" onclick="window.navigateQuickView(1)">Next →</button>
                <a href="" id="modal-full-link" class="btn btn-sm btn-primary">Open Full Page</a>
            </div>
        </div>
    </div>
</div>

</main>
${commonFooterHtml('')}

<script>
window.ALL_PROMPTS = ${allPromptsJsonString};
window.ACTIVE_FILTERED_PROMPTS = window.ALL_PROMPTS;

(function () {
    var state = {
        category: 'all',
        type: 'all',
        sort: 'new',
        query: '',
        page: 1,
        pageSize: 24
    };

    function normalizeCat(c) {
        return (c || '').replace(/&amp;/g, '&').trim().toLowerCase();
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get('pg')) state.page = parseInt(params.get('pg'), 10) || 1;
    if (params.get('cat')) state.category = params.get('cat');
    if (params.get('type')) state.type = params.get('type');
    if (params.get('sort')) state.sort = params.get('sort');
    if (params.get('q')) state.query = params.get('q');

    var searchInput = document.getElementById('search-input');
    var sortSelect = document.getElementById('sort-select');
    var clearBtn = document.getElementById('search-clear');

    if (sortSelect) sortSelect.value = state.sort;
    if (searchInput) {
        searchInput.value = state.query;
        if (state.query && clearBtn) clearBtn.classList.add('visible');
    }

    function updatePillsUI() {
        document.querySelectorAll('#type-pills .type-pill').forEach(function (el) {
            el.classList.toggle('active', el.dataset.type === state.type);
        });
        document.querySelectorAll('#category-pills .cat-chip').forEach(function (el) {
            el.classList.toggle('active', normalizeCat(el.dataset.cat) === normalizeCat(state.category));
        });
    }
    updatePillsUI();

    function syncUrl() {
        if (!window.history || !window.history.replaceState) return;
        var u = new URL(window.location);
        if (state.page > 1) u.searchParams.set('pg', state.page); else u.searchParams.delete('pg');
        if (state.category !== 'all') u.searchParams.set('cat', state.category); else u.searchParams.delete('cat');
        if (state.type !== 'all') u.searchParams.set('type', state.type); else u.searchParams.delete('type');
        if (state.sort !== 'new') u.searchParams.set('sort', state.sort); else u.searchParams.delete('sort');
        if (state.query) u.searchParams.set('q', state.query); else u.searchParams.delete('q');
        window.history.replaceState({}, '', u.toString());
    }

    window.setType = function (t) {
        state.type = t;
        state.page = 1;
        updatePillsUI();
        syncUrl();
        window.render();
    };

    window.setCategory = function (c) {
        state.category = c;
        state.page = 1;
        updatePillsUI();
        syncUrl();
        window.render();
    };

    window.setPage = function (pg) {
        state.page = pg;
        syncUrl();
        window.render();
        window.scrollTo({ top: 320, behavior: 'smooth' });
    };

    window.applyFilters = function () {
        state.query = searchInput.value.trim();
        state.sort = sortSelect.value;
        state.page = 1;
        if (clearBtn) clearBtn.classList.toggle('visible', state.query.length > 0);
        syncUrl();
        window.render();
    };

    window.clearSearch = function () {
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        if (clearBtn) clearBtn.classList.remove('visible');
        state.query = '';
        state.page = 1;
        syncUrl();
        window.render();
    };

    var searchDebounceTimer = null;
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            var val = e.target.value;
            if (clearBtn) clearBtn.classList.toggle('visible', val.length > 0);
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(function () {
                state.query = val.trim();
                state.page = 1;
                syncUrl();
                window.render();
            }, 30);
        });
    }

    window.quickCardCopy = function (id, btn) {
        fetch('data/prompts/' + id + '.json')
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (window.copyPromptText) {
                    window.copyPromptText(data.promptText, btn);
                    if (window.showToast) window.showToast('Prompt #' + id + ' copied to clipboard!');
                }
            })
            .catch(function () {
                window.location.href = 'prompts/' + id + '.html';
            });
    };

    window.render = function () {
        var cleanQ = state.query.toLowerCase().trim();
        var numQ = cleanQ.replace(/^[#\\s]+/, '').replace(/^prompt\\s*/i, '').trim();

        var filtered = window.ALL_PROMPTS.filter(function (p) {
            if (state.category !== 'all' && normalizeCat(p.category) !== normalizeCat(state.category)) {
                return false;
            }
            if (state.type === 'free' && !p.badge.toLowerCase().includes('free')) {
                return false;
            }
            if (state.type === 'premium' && p.badge.toLowerCase().includes('free')) {
                return false;
            }
            if (cleanQ) {
                var matchesId = numQ && String(p.id) === numQ;
                var matchesTitle = p.title.toLowerCase().includes(cleanQ);
                var matchesCat = p.category.toLowerCase().includes(cleanQ);
                if (!matchesId && !matchesTitle && !matchesCat) {
                    return false;
                }
            }
            return true;
        });

        filtered.sort(function (a, b) {
            if (state.sort === 'new') return b.id - a.id;
            if (state.sort === 'old') return a.id - b.id;
            if (state.sort === 'az') return a.title.localeCompare(b.title);
            if (state.sort === 'za') return b.title.localeCompare(a.title);
            return 0;
        });

        window.ACTIVE_FILTERED_PROMPTS = filtered;

        var countBadge = document.getElementById('results-count-badge');
        if (countBadge) {
            var catLabel = state.category === 'all' ? '' : ' in ' + state.category;
            countBadge.innerHTML = 'Showing <b>' + filtered.length + '</b> of ' + window.ALL_PROMPTS.length + ' prompts' + catLabel;
        }

        var totalPages = Math.ceil(filtered.length / state.pageSize) || 1;
        if (state.page > totalPages) state.page = totalPages;
        var start = (state.page - 1) * state.pageSize;
        var end = start + state.pageSize;
        var pageItems = filtered.slice(start, end);

        var grid = document.getElementById('prompts-grid');
        if (pageItems.length === 0) {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius);"><h3 style="font-size:20px;margin-bottom:8px;">No prompts found</h3><p style="color:var(--text-secondary);margin-bottom:20px;">Try adjusting your keyword or reset filters to see all 279 items.</p><button type="button" class="btn btn-primary" onclick="window.clearSearch(); window.setCategory(\\'all\\'); window.setType(\\'all\\');">Reset All Filters</button></div>';
        } else {
            var cardsHtml = pageItems.map(function (item, idx) {
                var isFree = item.badge.toLowerCase().includes('free');
                var badgeClass = isFree ? 'card-badge-free' : 'card-badge-premium';
                var badgeText = isFree ? 'FREE' : '⭐ Premium';
                var btnClass = isFree ? 'btn-green' : 'btn-primary';
                var delay = ((idx % 24) * 0.025).toFixed(3);

                return '<div class="pcard" style="animation-delay:' + delay + 's;">' +
                    '<div class="pcard-thumb">' +
                        '<a href="prompts/' + item.id + '.html" class="pcard-thumb-link" aria-label="' + item.title.replace(/"/g, '&quot;') + '">' +
                            '<img src="' + item.thumbnail + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy" decoding="async" width="640" height="360">' +
                        '</a>' +
                        '<span class="badge-top-left card-badge card-badge-id">#' + item.id + '</span>' +
                        '<span class="badge-top-right card-badge ' + badgeClass + '">' + badgeText + '</span>' +
                        '<div class="card-quick-actions">' +
                            '<button type="button" class="quick-action-btn btn-quick-copy" onclick="window.quickCardCopy(' + item.id + ', this)">' +
                                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
                                'Copy Prompt' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="pcard-body">' +
                        '<div class="pcard-meta-row">' +
                            '<span class="pcard-cat">' + item.category + '</span>' +
                        '</div>' +
                        '<h3 class="pcard-title"><a href="prompts/' + item.id + '.html">' + item.title + '</a></h3>' +
                    '</div>' +
                    '<div class="pcard-foot">' +
                        '<a href="prompts/' + item.id + '.html" class="btn btn-sm ' + btnClass + '">View Prompt →</a>' +
                    '</div>' +
                '</div>';
            }).join('');
            grid.innerHTML = cardsHtml;
        }

        var pag = document.getElementById('pagination');
        if (totalPages <= 1) {
            pag.innerHTML = '';
        } else {
            var pagHtml = '';
            if (state.page > 1) {
                pagHtml += '<button type="button" onclick="window.setPage(' + (state.page - 1) + ')" class="page-link">← Prev</button>';
            }
            var pStart = Math.max(1, state.page - 3);
            var pEnd = Math.min(totalPages, state.page + 3);
            if (pStart > 1) {
                pagHtml += '<button type="button" onclick="window.setPage(1)" class="page-link">1</button>';
                if (pStart > 2) pagHtml += '<span style="color:var(--text-muted);padding:8px 4px;">…</span>';
            }
            for (var i = pStart; i <= pEnd; i++) {
                var activeClass = i === state.page ? 'active' : '';
                pagHtml += '<button type="button" onclick="window.setPage(' + i + ')" class="page-link ' + activeClass + '">' + i + '</button>';
            }
            if (pEnd < totalPages) {
                if (pEnd < totalPages - 1) pagHtml += '<span style="color:var(--text-muted);padding:8px 4px;">…</span>';
                pagHtml += '<button type="button" onclick="window.setPage(' + totalPages + ')" class="page-link">' + totalPages + '</button>';
            }
            if (state.page < totalPages) {
                pagHtml += '<button type="button" onclick="window.setPage(' + (state.page + 1) + ')" class="page-link">Next →</button>';
            }
            pag.innerHTML = pagHtml;
        }
    };

    window.render();
})();
</script>
<script src="assets/js/main.js?v=25"></script>
</body>
</html>`;

fs.writeFileSync('browse.html', browseHtml, 'utf8');
console.log('Saved browse.html (modern interactive prompt browser).');

// ─── 4. Generate index.html (Home page with local links) ───
let homeHtml = otherPages.home.html;
homeHtml = homeHtml.replace(/https:\/\/soniprompts\.com\/assets\//g, 'assets/');
homeHtml = homeHtml.replace(/https:\/\/soniprompts\.com\/uploads\//g, 'uploads/');
homeHtml = homeHtml.replace(/https:\/\/soniprompts\.com\/browse\.php/g, 'browse.html');
homeHtml = homeHtml.replace(/https:\/\/soniprompts\.com\/community\.php/g, 'community.html');
homeHtml = homeHtml.replace(/https:\/\/soniprompts\.com\/pricing\.php/g, 'pricing.html');
homeHtml = homeHtml.replace(/https:\/\/soniprompts\.com\/contact\.php/g, 'contact.html');
homeHtml = homeHtml.replace(/https:\/\/soniprompts\.com\/privacy\.php/g, 'privacy.html');
homeHtml = homeHtml.replace(/https:\/\/soniprompts\.com\/terms\.php/g, 'terms.html');
homeHtml = homeHtml.replace(/https:\/\/soniprompts\.com\/refund\.php/g, 'refund.html');
homeHtml = homeHtml.replace(/https:\/\/soniprompts\.com\/prompt\.php\?id=(\d+)/g, 'prompts/$1.html');
homeHtml = homeHtml.replace(/https:\/\/soniprompts\.com\//g, 'index.html');
homeHtml = homeHtml.replace(/<a href="[^"]*account\.php">My Account<\/a>\s*<a href="[^"]*logout\.php" class="nav-btn">Logout<\/a>/g, '<a href="pricing.html">Join Community</a>');

// Replace header in index.html
homeHtml = homeHtml.replace(/<header class="site-header">[\s\S]*?<\/header>/, commonHeaderHtml(''));
// Replace footer in index.html
homeHtml = homeHtml.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, commonFooterHtml(''));
homeHtml = homeHtml.replace(/NavPrompts/g, 'YeaPrompts');

// Ensure data-theme="dark" attribute
if (!homeHtml.includes('data-theme')) {
  homeHtml = homeHtml.replace('<html lang="en">', '<html lang="en" data-theme="dark"><script>(function(){var t=localStorage.getItem("yeaprompts_theme")||localStorage.getItem("navprompts_theme")||"dark";document.documentElement.setAttribute("data-theme",t);})();</script>');
}

fs.writeFileSync('index.html', homeHtml, 'utf8');
console.log('Saved index.html (Home).');

// ─── 5. Generate pricing.html, contact.html, privacy.html, terms.html, refund.html ───
const staticPages = ['pricing', 'contact', 'privacy', 'terms', 'refund'];
for (const sp of staticPages) {
  if (otherPages[sp]) {
    let html = otherPages[sp].html;
    html = html.replace(/https:\/\/soniprompts\.com\/assets\//g, 'assets/');
    html = html.replace(/https:\/\/soniprompts\.com\/uploads\//g, 'uploads/');
    html = html.replace(/https:\/\/soniprompts\.com\/browse\.php/g, 'browse.html');
    html = html.replace(/https:\/\/soniprompts\.com\/community\.php/g, 'community.html');
    html = html.replace(/https:\/\/soniprompts\.com\/pricing\.php/g, 'pricing.html');
    html = html.replace(/https:\/\/soniprompts\.com\/contact\.php/g, 'contact.html');
    html = html.replace(/https:\/\/soniprompts\.com\/privacy\.php/g, 'privacy.html');
    html = html.replace(/https:\/\/soniprompts\.com\/terms\.php/g, 'terms.html');
    html = html.replace(/https:\/\/soniprompts\.com\/refund\.php/g, 'refund.html');
    html = html.replace(/https:\/\/soniprompts\.com\/prompt\.php\?id=(\d+)/g, 'prompts/$1.html');
    html = html.replace(/https:\/\/soniprompts\.com\//g, 'index.html');
    html = html.replace(/NavPrompts/g, 'YeaPrompts');

    // Replace header and footer
    html = html.replace(/<header class="site-header">[\s\S]*?<\/header>/, commonHeaderHtml(''));
    html = html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, commonFooterHtml(''));

    if (!html.includes('data-theme')) {
      html = html.replace('<html lang="en">', '<html lang="en" data-theme="dark"><script>(function(){var t=localStorage.getItem("yeaprompts_theme")||localStorage.getItem("navprompts_theme")||"dark";document.documentElement.setAttribute("data-theme",t);})();</script>');
    }

    if (sp === 'contact') {
      const contactScript = `<script>
document.addEventListener('DOMContentLoaded', function() {
    var form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var card = form.closest('.auth-card') || form.parentElement;
            card.innerHTML = '<div style="padding:28px 16px;text-align:center;"><h3 style="color:var(--green);margin-bottom:12px;">Message Sent Successfully</h3><p style="color:var(--text-secondary);">Thank you for contacting us. We will get back to you within 24 hours.</p><a href="browse.html" class="btn btn-primary" style="margin-top:20px;display:inline-block;">Browse Prompts</a></div>';
        });
    }
});
</script>
</body>`;
      html = html.replace('</body>', contactScript);
    } else if (sp === 'community') {
      const communityScript = `<script>
document.addEventListener('DOMContentLoaded', function() {
    var form = document.querySelector('.composer form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var txt = form.querySelector('textarea').value.trim();
            if (!txt) return;
            if (window.showToast) window.showToast('Post submitted! It will appear after approval.');
            form.querySelector('textarea').value = '';
            var attach = form.querySelector('.attach-name');
            if (attach) attach.textContent = '';
        });
    }
});
</script>
</body>`;
      html = html.replace('</body>', communityScript);
    }

    fs.writeFileSync(`${sp}.html`, html, 'utf8');
    console.log(`Saved ${sp}.html.`);
  }
}

// ─── 6. Generate api/load_more.php response data for homepage ───
const freePrompts = prompts.filter(p => (p.badge || '').toLowerCase().includes('free')).slice(0, 10);
const moreHtml = freePrompts.map(p => {
  let thumbRel = 'assets/img/cover.jpg';
  if (p.thumbnail) {
    let clean = p.thumbnail.split('?')[0];
    if (clean.startsWith('http')) {
      try {
        const u = new URL(clean);
        thumbRel = u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;
      } catch (e) {
        thumbRel = clean;
      }
    } else {
      thumbRel = clean.startsWith('/') ? clean.slice(1) : clean;
    }
  }
  return `<a class="prow" href="prompts/${p.id}.html">
    <div class="prow-thumb">
      <img src="${thumbRel}" alt="" loading="lazy" decoding="async" width="640" height="360">
    </div>
    <div class="prow-body">
      <h3>${escapeHtml(p.title)}</h3>
      <span class="prow-cat">1 prompt • Free</span>
      <span class="prow-btn">Get access</span>
    </div>
  </a>`;
}).join('\n');

fs.writeFileSync('api/load_more_data.json', JSON.stringify({ html: moreHtml, count: freePrompts.length, has_more: false }), 'utf8');
console.log('Modern site generation complete.');
