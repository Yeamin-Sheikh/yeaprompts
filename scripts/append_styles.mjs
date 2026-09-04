import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.join(__dirname, '..', 'assets', 'css', 'style.css');

const stylesToAppend = `
/* ─── Fontem Landing Page System ─── */

/* 1. Hero Section */
.hero-section {
    padding: 64px 24px 48px;
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
    position: relative;
}

.hero-pill-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    border-radius: var(--radius-pill);
    background: rgba(139, 92, 246, 0.12);
    border: 1px solid rgba(139, 92, 246, 0.35);
    color: #C084FC;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.02em;
    margin-bottom: 24px;
}

.hero-pill-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10B981;
    box-shadow: 0 0 8px #10B981;
}

.hero-title {
    font-size: clamp(34px, 5.5vw, 64px);
    font-weight: 800;
    line-height: 1.12;
    letter-spacing: -0.03em;
    margin-bottom: 20px;
    max-width: 960px;
    margin-left: auto;
    margin-right: auto;
    color: var(--text);
}

.hero-title-gradient {
    background: linear-gradient(135deg, #FFFFFF 0%, #A5B4FC 45%, #C084FC 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline;
}

[data-theme="light"] .hero-title-gradient {
    background: linear-gradient(135deg, #0F172A 0%, #4338CA 55%, #7C3AED 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.hero-sub {
    font-size: clamp(16px, 2vw, 19px);
    line-height: 1.6;
    color: var(--text-secondary);
    max-width: 660px;
    margin: 0 auto 36px;
    font-weight: 400;
}

.hero-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 48px;
}

.hero-btn-primary {
    padding: 14px 32px;
    font-size: 15px;
    font-weight: 700;
    border-radius: var(--radius-pill);
    background: var(--primary);
    color: #FFFFFF;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 8px 24px var(--primary-glow);
    transition: transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
    border: none;
    cursor: pointer;
}

.hero-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(139, 92, 246, 0.5);
    color: #FFFFFF;
}

.hero-btn-secondary {
    padding: 14px 28px;
    font-size: 15px;
    font-weight: 600;
    border-radius: var(--radius-pill);
    background: var(--bg-surface);
    color: var(--text);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--border);
    transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}

.hero-btn-secondary:hover {
    background: var(--bg-card-hover);
    border-color: var(--border-focus);
    transform: translateY(-2px);
    color: var(--text);
}

.hero-stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    max-width: 920px;
    margin: 0 auto;
    padding-top: 12px;
}

.hero-stat-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-card);
    padding: 18px 16px;
    text-align: center;
    transition: border-color var(--dur-fast) var(--ease-out);
}

.hero-stat-card:hover {
    border-color: var(--border-focus);
}

.hero-stat-num {
    font-size: clamp(22px, 3vw, 28px);
    font-weight: 800;
    color: var(--text);
    line-height: 1.1;
    font-feature-settings: "tnum";
    font-variant-numeric: tabular-nums;
}

.hero-stat-label {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-top: 6px;
}

/* 2. Mandatory B11 Tagline Scroll Reveal Section */
.tagline-reveal-section {
    padding: 80px 24px;
    max-width: 1100px;
    margin: 0 auto;
    text-align: center;
    border-top: 1px solid var(--border-subtle);
    border-bottom: 1px solid var(--border-subtle);
}

.tagline-lead {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--primary);
    margin-bottom: 20px;
}

.tagline-reveal-text {
    font-size: clamp(24px, 4vw, 44px);
    font-weight: 800;
    line-height: 1.35;
    letter-spacing: -0.02em;
    margin: 0 auto;
    max-width: 980px;
}

.tagline-word {
    display: inline-block;
    opacity: 0.22;
    filter: blur(1.5px);
    color: var(--text);
    transition: opacity 0.32s var(--ease-out), filter 0.32s var(--ease-out), color 0.32s var(--ease-out);
    margin: 0 4px;
}

.tagline-word.is-active {
    opacity: 1;
    filter: blur(0);
    color: var(--text);
}

.tagline-word.accent-word.is-active {
    color: #A855F7;
    text-shadow: 0 0 20px rgba(168, 85, 247, 0.45);
}

/* 3. Live Interactive Prompt Sandbox */
.sandbox-section {
    padding: 72px 24px;
    max-width: 1200px;
    margin: 0 auto;
}

.section-head {
    text-align: center;
    margin-bottom: 40px;
}

.section-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 14px;
    border-radius: var(--radius-pill);
    background: var(--primary-light);
    color: var(--primary);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 12px;
}

.section-title {
    font-size: clamp(24px, 3.5vw, 36px);
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.02em;
    margin-bottom: 10px;
}

.section-desc {
    font-size: 15px;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
}

/* Sandbox Card with Fontem Nested Radius Math: outer 18px, inner 10px, gap 16px */
.sandbox-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 20px;
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 20px;
    box-shadow: var(--shadow-md);
    position: relative;
    overflow: hidden;
}

.sandbox-media {
    position: relative;
    border-radius: var(--radius-inner);
    overflow: hidden;
    background: var(--bg-surface);
    aspect-ratio: 16/10;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-subtle);
}

.sandbox-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.sandbox-media-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(15, 23, 42, 0.82);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #FFFFFF;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    padding: 4px 10px;
    border-radius: var(--radius-pill);
    text-transform: uppercase;
}

.sandbox-details {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
}

.sandbox-header-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
}

.sandbox-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.sandbox-tag {
    font-size: 11.5px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text-secondary);
}

.sandbox-prompt-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text);
    margin-top: 6px;
    line-height: 1.3;
}

.sandbox-code-wrap {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.sandbox-code-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--bg-surface);
    border: 1px solid var(--code-border);
    border-bottom: none;
    border-top-left-radius: var(--radius-inner);
    border-top-right-radius: var(--radius-inner);
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
}

.sandbox-code-box {
    background: var(--prompt-code-bg);
    border: 1px solid var(--code-border);
    border-bottom-left-radius: var(--radius-inner);
    border-bottom-right-radius: var(--radius-inner);
    padding: 16px;
    color: #E2E8F0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    line-height: 1.65;
    max-height: 220px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
    user-select: text;
}

.sandbox-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
}

.sandbox-copy-btn {
    flex: 1;
    padding: 12px 20px;
    border-radius: var(--radius-pill);
    background: var(--primary);
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 14px var(--primary-glow);
    transition: transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
}

.sandbox-copy-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.45);
}

.sandbox-copy-btn.copied {
    background: #10B981;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
}

.sandbox-view-btn {
    padding: 12px 20px;
    border-radius: var(--radius-pill);
    background: var(--bg-surface);
    color: var(--text);
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    border: 1px solid var(--border);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
}

.sandbox-view-btn:hover {
    background: var(--bg-card-hover);
    border-color: var(--border-focus);
}

/* 4. Curated Prompts Section */
.curated-section {
    padding: 72px 24px;
    max-width: 1200px;
    margin: 0 auto;
}

.curated-foot-action {
    text-align: center;
    margin-top: 36px;
}

.curated-all-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 32px;
    border-radius: var(--radius-pill);
    background: var(--bg-surface);
    border: 1.5px solid var(--border);
    color: var(--text);
    font-size: 15px;
    font-weight: 700;
    text-decoration: none;
    transition: border-color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
}

.curated-all-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    transform: translateY(-2px);
    background: var(--bg-card-hover);
}

/* 5. Creator Workflow Section */
.workflow-section {
    padding: 72px 24px;
    max-width: 1100px;
    margin: 0 auto;
}

.workflow-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 40px;
}

.workflow-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: border-color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}

.workflow-card:hover {
    border-color: var(--border-focus);
    transform: translateY(-3px);
}

.workflow-step-num {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--primary-light);
    color: var(--primary);
    font-weight: 800;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-feature-settings: "tnum";
}

.workflow-card-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
}

.workflow-card-desc {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
}

/* 6. Creator FAQ Section */
.faq-section {
    padding: 72px 24px 96px;
    max-width: 860px;
    margin: 0 auto;
}

.faq-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 36px;
}

.faq-item {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    overflow: hidden;
    transition: border-color var(--dur-fast) var(--ease-out);
}

.faq-item[open] {
    border-color: var(--border-focus);
}

.faq-summary {
    padding: 20px 24px;
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    user-select: none;
}

.faq-summary::-webkit-details-marker {
    display: none;
}

.faq-icon {
    width: 20px;
    height: 20px;
    color: var(--text-secondary);
    transition: transform var(--dur-fast) var(--ease-out);
    flex-shrink: 0;
}

.faq-item[open] .faq-icon {
    transform: rotate(180deg);
    color: var(--primary);
}

.faq-content {
    padding: 0 24px 22px;
    font-size: 14.5px;
    line-height: 1.65;
    color: var(--text-secondary);
}

.faq-content p {
    margin: 0;
}

/* Responsive adjustments for new sections */
@media (max-width: 960px) {
    .sandbox-card {
        grid-template-columns: 1fr;
    }
    .hero-stats-row {
        grid-template-columns: repeat(2, 1fr);
    }
    .workflow-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 600px) {
    .hero-section {
        padding: 40px 16px 32px;
    }
    .hero-stats-row {
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }
    .hero-stat-card {
        padding: 14px 10px;
    }
    .tagline-reveal-section {
        padding: 48px 16px;
    }
    .sandbox-section,
    .curated-section,
    .workflow-section,
    .faq-section {
        padding: 48px 16px;
    }
}
`;

const cssContent = fs.readFileSync(cssPath, 'utf8');
const targetMarker = '@media (prefers-reduced-motion: reduce)';

if (!cssContent.includes('.hero-section')) {
    if (cssContent.includes(targetMarker)) {
        const parts = cssContent.split(targetMarker);
        const newCss = parts[0] + stylesToAppend + '\n' + targetMarker + parts[1];
        fs.writeFileSync(cssPath, newCss, 'utf8');
        console.log('Appended Fontem styles before prefers-reduced-motion block.');
    } else {
        fs.writeFileSync(cssPath, cssContent + '\n' + stylesToAppend, 'utf8');
        console.log('Appended Fontem styles to the end of style.css.');
    }
} else {
    console.log('Fontem styles already present in style.css');
}
