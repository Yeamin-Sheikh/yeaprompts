import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.join(__dirname, '..', 'index.html');

// Read prompt 281 for the sandbox
const prompts = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'prompts.json'), 'utf8'));
const p281 = prompts.find(p => p.id === 281);
const sandboxPromptExcerpt = p281.promptText;

// Curated 4 cards
const curatedIds = [281, 280, 279, 278];
const curatedPrompts = curatedIds.map(id => prompts.find(p => p.id === id));

const curatedCardsHtml = curatedPrompts.map(p => `
        <article class="pcard">
            <div class="pcard-thumb">
                <a href="prompts/${p.id}.html" class="pcard-thumb-link">
                    <img src="${p.thumbnail}" alt="${p.title}" loading="lazy" decoding="async" width="660" height="371">
                </a>
                <span class="badge-top-left card-badge card-badge-free">Free</span>
                <span class="badge-top-right card-badge card-badge-id">#${p.id}</span>
                <div class="card-quick-actions">
                    <a href="prompts/${p.id}.html" class="quick-action-btn">View Master Prompt</a>
                </div>
            </div>
            <div class="pcard-body">
                <div class="pcard-meta-row">
                    <span class="pcard-cat">${p.category}</span>
                    <span class="pcard-date">Master Engine</span>
                </div>
                <h3 class="pcard-title">
                    <a href="prompts/${p.id}.html">${p.title}</a>
                </h3>
            </div>
            <div class="pcard-foot">
                <a href="prompts/${p.id}.html" class="btn btn-outline" style="width:100%;text-align:center;">Open Prompt →</a>
            </div>
        </article>
`).join('\n');

// Tagline words with span wrapping
const taglineRaw = "VIRAL HOOKS ENGINEERED FOR SEEDANCE, KLING, AND VEO. BUILT FOR CREATORS WHO REFUSE TO BLEND IN.";
const taglineWordsHtml = taglineRaw.split(' ').map((word, idx) => {
    const isAccent = word.includes('SEEDANCE') || word.includes('KLING') || word.includes('VEO');
    const accentClass = isAccent ? ' accent-word' : '';
    return `<span class="tagline-word${accentClass}">${word}</span>`;
}).join(' ');

// Escape prompt text for display in HTML
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const html = `<!DOCTYPE html>
<html lang="en" data-theme="dark"><script>(function(){var t=localStorage.getItem("yeaprompts_theme")||localStorage.getItem("navprompts_theme")||"dark";document.documentElement.setAttribute("data-theme",t);})();</script>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>YeaPrompts. Viral AI Video Prompts Library</title>
<meta name="description" content="Viral AI video prompts for Facebook Reels, YouTube Shorts, Instagram, and TikTok. Works with Seedance, Kling, Veo, and any AI video generator.">
<link rel="icon" type="image/png" href="assets/img/logo.png">
<meta property="og:title" content="YeaPrompts. Viral AI Video Prompts Library">
<meta property="og:description" content="Viral AI video prompts for Reels, Shorts, and TikTok. Built for creators.">
<meta property="og:image" content="assets/img/cover.jpg">
<meta property="og:type" content="website">
<link rel="stylesheet" href="assets/css/style.css?v=22">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" media="print" onload="this.media='all'"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"></noscript>
</head>
<body>

<header class="site-header">
    <div class="container header-inner">
        <a href="index.html" class="brand">
            <img src="assets/img/logo.png" alt="YeaPrompts Logo">
            <span>Yea<b>Prompts</b></span>
        </a>
        <div class="header-actions">
            <input type="checkbox" id="nav-toggle" class="nav-toggle-cb">
            <label for="nav-toggle" class="nav-toggle">☰</label>
            <nav class="main-nav">
                <a href="index.html">Home</a>
                <a href="browse.html">All Prompts</a>
                <a href="community.html">Social Corner</a>
                <a href="pricing.html">Join Community</a>
            </nav>
            <button type="button" class="theme-toggle-btn" onclick="window.toggleTheme()" aria-label="Toggle theme" title="Toggle theme">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            </button>
        </div>
    </div>
</header>

<main>

    <!-- 1. Hero Section -->
    <section class="hero-section">
        <div class="hero-pill-badge">
            <span class="hero-pill-dot"></span>
            279 Tested Prompts Online
        </div>
        <h1 class="hero-title">
            Viral AI video prompts <span class="hero-title-gradient">engineered for massive reach</span>
        </h1>
        <p class="hero-sub">
            Stop guessing video prompts. Copy tested master instructions calibrated for Seedance, Kling, and Veo. Ready to drop into your AI video generator.
        </p>
        <div class="hero-actions">
            <a href="browse.html" class="hero-btn-primary">
                Explore all prompts
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
            <a href="#sandbox" class="hero-btn-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
                Open live sandbox
            </a>
        </div>
        <div class="hero-stats-row">
            <div class="hero-stat-card">
                <div class="hero-stat-num">279</div>
                <div class="hero-stat-label">Curated prompts</div>
            </div>
            <div class="hero-stat-card">
                <div class="hero-stat-num">3</div>
                <div class="hero-stat-label">AI engines</div>
            </div>
            <div class="hero-stat-card">
                <div class="hero-stat-num">100%</div>
                <div class="hero-stat-label">Free access</div>
            </div>
            <div class="hero-stat-card">
                <div class="hero-stat-num">1-Click</div>
                <div class="hero-stat-label">Instant copy</div>
            </div>
        </div>
    </section>

    <!-- 2. Mandatory B11 Tagline Scroll Reveal Section -->
    <section class="tagline-reveal-section">
        <div class="tagline-lead">Built for high retention</div>
        <div class="tagline-reveal-text">
            ${taglineWordsHtml}
        </div>
    </section>

    <!-- 3. Interactive Live Prompt Sandbox -->
    <section class="sandbox-section" id="sandbox">
        <div class="section-head">
            <span class="section-badge">Interactive preview</span>
            <h2 class="section-title">Test a master prompt</h2>
            <p class="section-desc">Inspect how a full master prompt is structured with camera directions, motion physics, and cinematic lighting.</p>
        </div>

        <div class="sandbox-card">
            <div class="sandbox-media">
                <img src="${p281.thumbnail}" alt="${p281.title}" loading="lazy" decoding="async">
                <span class="sandbox-media-badge">Prompt #${p281.id} Demo</span>
            </div>
            <div class="sandbox-details">
                <div>
                    <div class="sandbox-header-meta">
                        <div class="sandbox-tags">
                            <span class="sandbox-tag">Seedance</span>
                            <span class="sandbox-tag">Kling</span>
                            <span class="sandbox-tag">Veo</span>
                            <span class="sandbox-tag">30s Format</span>
                        </div>
                        <span class="card-badge card-badge-free">Free</span>
                    </div>
                    <h3 class="sandbox-prompt-title">${p281.title}</h3>
                </div>

                <div class="sandbox-code-wrap">
                    <div class="sandbox-code-header">
                        <span>Master Prompt Instructions</span>
                        <span>Prompt #${p281.id}</span>
                    </div>
                    <pre class="sandbox-code-box" id="sandbox-prompt-code"><code>${escapeHtml(sandboxPromptExcerpt)}</code></pre>
                </div>

                <div class="sandbox-actions">
                    <button type="button" class="sandbox-copy-btn" id="sandbox-copy-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        Copy full master prompt
                    </button>
                    <a href="prompts/${p281.id}.html" class="sandbox-view-btn">
                        View page
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- 4. Curated Viral Prompts Grid (4 cards in 1 row) -->
    <section class="curated-section">
        <div class="section-head">
            <span class="section-badge">Curated selection</span>
            <h2 class="section-title">Top performing prompts</h2>
            <p class="section-desc">Hand-picked prompts that drive strong viewer retention across Shorts, Reels, and TikTok.</p>
        </div>

        <div class="grid">
            ${curatedCardsHtml}
        </div>

        <div class="curated-foot-action">
            <a href="browse.html" class="curated-all-btn">
                Browse all 279 prompts
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </a>
        </div>
    </section>

    <!-- 5. Creator Workflow Section -->
    <section class="workflow-section">
        <div class="section-head">
            <span class="section-badge">Simple pipeline</span>
            <h2 class="section-title">How YeaPrompts works</h2>
            <p class="section-desc">Three steps from prompt discovery to published viral video.</p>
        </div>

        <div class="workflow-grid">
            <div class="workflow-card">
                <div class="workflow-step-num">1</div>
                <div class="workflow-card-title">Discover and filter</div>
                <div class="workflow-card-desc">Search by topic, style, or duration to find hooks suited to your audience niche.</div>
            </div>
            <div class="workflow-card">
                <div class="workflow-step-num">2</div>
                <div class="workflow-card-title">Copy with one click</div>
                <div class="workflow-card-desc">Grab production-ready prompts packed with motion dynamics and continuity constraints.</div>
            </div>
            <div class="workflow-card">
                <div class="workflow-step-num">3</div>
                <div class="workflow-card-title">Generate and publish</div>
                <div class="workflow-card-desc">Paste into Kling, Seedance, or Veo, render your clip, and post to Reels, Shorts, or TikTok.</div>
            </div>
        </div>
    </section>

    <!-- 6. Creator FAQ Accordion -->
    <section class="faq-section">
        <div class="section-head">
            <span class="section-badge">Frequently asked</span>
            <h2 class="section-title">Questions and answers</h2>
            <p class="section-desc">Common questions about using YeaPrompts master instructions.</p>
        </div>

        <div class="faq-list">
            <details class="faq-item" open>
                <summary class="faq-summary">
                    <span>What AI video tools do these prompts work with?</span>
                    <svg class="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </summary>
                <div class="faq-content">
                    <p>YeaPrompts master instructions work with Seedance, Kling, Google Veo, Runway Gen-3, Luma Dream Machine, and Midjourney. The structural constraints maintain stable character geometry and realistic physics across platforms.</p>
                </div>
            </details>

            <details class="faq-item">
                <summary class="faq-summary">
                    <span>Are all prompts free to use?</span>
                    <svg class="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </summary>
                <div class="faq-content">
                    <p>Yes. Every master prompt in our public catalog is accessible with zero cost. You can copy, modify, and use them for commercial or personal video production.</p>
                </div>
            </details>

            <details class="faq-item">
                <summary class="faq-summary">
                    <span>How do master prompts keep motion consistent?</span>
                    <svg class="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </summary>
                <div class="faq-content">
                    <p>Each master prompt specifies fixed camera axes, lighting sources, subject velocity, and transition anchors. This prevents AI engines from morphing faces or distorting objects between keyframes.</p>
                </div>
            </details>

            <details class="faq-item">
                <summary class="faq-summary">
                    <span>Can I customize the characters or setting in a prompt?</span>
                    <svg class="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </summary>
                <div class="faq-content">
                    <p>Yes. You can swap out character descriptions, clothing, environments, or lighting cues while keeping the prompt pacing and camera direction syntax intact.</p>
                </div>
            </details>

            <details class="faq-item">
                <summary class="faq-summary">
                    <span>How often is the prompt library updated?</span>
                    <svg class="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </summary>
                <div class="faq-content">
                    <p>New tested prompts are added regularly, focusing on emerging short-form video trends and algorithm-favored hooks.</p>
                </div>
            </details>

            <details class="faq-item">
                <summary class="faq-summary">
                    <span>Where can I share my generated videos and get feedback?</span>
                    <svg class="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </summary>
                <div class="faq-content">
                    <p>Visit our Social Corner to share links, post your results, and connect with fellow creators in the community.</p>
                </div>
            </details>
        </div>
    </section>

</main>

<footer class="site-footer">
    <div class="container footer-grid">
        <div class="f-left">
            <div class="footer-brand">
                <img src="assets/img/logo.png" alt="YeaPrompts Logo">
                <span>Yea<b>Prompts</b></span>
            </div>
            <p class="footer-tag">Viral AI video prompts for creators</p>
        </div>

        <nav class="footer-nav f-center">
            <a href="browse.html">All Prompts</a>
            <span class="footer-dot">·</span>
            <a href="community.html">Social Corner</a>
            <span class="footer-dot">·</span>
            <a href="pricing.html">Join Community</a>
            <span class="footer-dot">·</span>
            <a href="contact.html">Contact</a>
            <span class="footer-dot">·</span>
            <a href="privacy.html">Privacy</a>
            <span class="footer-dot">·</span>
            <a href="terms.html">Terms</a>
            <span class="footer-dot">·</span>
            <a href="refund.html">Refunds</a>
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

<a href="https://wa.me/919131421048?text=Hi%21+I%27m+a+creator+using+YeaPrompts.+I+need+some+help."
   target="_blank" rel="noopener" class="wa-float" title="WhatsApp Support">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.1 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.79h-.01a9.72 9.72 0 0 1-4.96-1.36l-.36-.21-3.69.97.98-3.6-.23-.37a9.72 9.72 0 0 1-1.49-5.18c0-5.37 4.37-9.74 9.75-9.74a9.68 9.68 0 0 1 6.89 2.86 9.68 9.68 0 0 1 2.85 6.89c0 5.38-4.37 9.74-9.73 9.74zm8.28-18.02A11.64 11.64 0 0 0 12.05.33C5.6.33.35 5.58.35 12.03c0 2.06.54 4.07 1.56 5.84L.25 23.79l6.07-1.59a11.68 11.68 0 0 0 5.72 1.46h.01c6.45 0 11.7-5.25 11.7-11.7 0-3.13-1.22-6.07-3.42-8.19z"/></svg>
    <span class="wa-float-label">Support</span>
</a>

<script src="assets/js/main.js?v=7"></script>
</body>
</html>
`;

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully generated redesigned index.html');
