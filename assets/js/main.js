/* ════════════════════════════════════════════════════════════════════════════════
   YeaPrompts — Modern Frontend Interaction Engine
   Theme Switcher · 21st.dev Micro-Interactions · 1-Click Copy · High-DPI
   ════════════════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ─── Theme Management (Dark by Default) ─── */
    var initTheme = function () {
        var savedTheme = localStorage.getItem('yeaprompts_theme') || localStorage.getItem('navprompts_theme');
        var theme = savedTheme || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeToggleIcons(theme);
    };

    var toggleTheme = function () {
        var current = document.documentElement.getAttribute('data-theme') || 'dark';
        var next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('yeaprompts_theme', next);
        updateThemeToggleIcons(next);
        showToast(next === 'dark' ? 'Cinematic Dark theme active' : 'Slate Light theme active');
    };

    var updateThemeToggleIcons = function (theme) {
        var btns = document.querySelectorAll('.theme-toggle-btn');
        btns.forEach(function (btn) {
            btn.classList.add('theme-spin');
            setTimeout(function () { btn.classList.remove('theme-spin'); }, 350);
            if (theme === 'dark') {
                // Show sun icon to indicate clicking will switch to light
                btn.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
                btn.setAttribute('title', 'Switch to Light Mode');
                btn.setAttribute('aria-label', 'Switch to Light Mode');
            } else {
                // Show moon icon
                btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
                btn.setAttribute('title', 'Switch to Dark Mode');
                btn.setAttribute('aria-label', 'Switch to Dark Mode');
            }
        });
    };

    window.toggleTheme = toggleTheme;
    initTheme();

    /* ─── Toast Notifications ─── */
    var toastTimer = null;
    var showToast = function (message) {
        var toast = document.getElementById('global-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'global-toast';
            toast.className = 'copy-toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg><span>' + message + '</span>';
        toast.classList.remove('show');
        void toast.offsetWidth;
        toast.classList.add('show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toast.classList.remove('show');
        }, 2200);
    };
    window.showToast = showToast;

    /* ─── Clipboard Copy Helper ─── */
    var copyTextToClipboard = function (text, btnElement) {
        if (!text) return;
        var onCopied = function () {
            if (btnElement) {
                var originalHtml = btnElement.innerHTML;
                btnElement.classList.add('btn-copied');
                btnElement.innerHTML = '✓ Copied!';
                setTimeout(function () {
                    btnElement.innerHTML = originalHtml;
                    btnElement.classList.remove('btn-copied');
                }, 2000);
            }
            showToast('Master prompt copied to clipboard!');
        };

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(onCopied).catch(function () {
                fallbackCopyText(text, onCopied);
            });
        } else {
            fallbackCopyText(text, onCopied);
        }
    };

    var fallbackCopyText = function (text, cb) {
        var textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            textArea.remove();
            if (cb) cb();
        } catch (err) {
            textArea.remove();
            prompt('Copy prompt manually:', text);
        }
    };

    window.copyPromptText = copyTextToClipboard;

    /* ─── Prompt Cache & Quick View Modal ─── */
    var promptCache = {};
    var currentModalPromptId = null;

    var fetchPromptDetails = function (id, callback) {
        if (promptCache[id]) {
            callback(promptCache[id]);
            return;
        }
        // Try fetching individual json file
        fetch('data/prompts/' + id + '.json')
            .then(function (res) {
                if (!res.ok) throw new Error('File not found');
                return res.json();
            })
            .then(function (data) {
                promptCache[id] = data;
                callback(data);
            })
            .catch(function () {
                // Fallback to API route if served via server
                fetch('/api/prompts/' + id)
                    .then(function (res) { return res.json(); })
                    .then(function (data) {
                        promptCache[id] = data;
                        callback(data);
                    })
                    .catch(function () {
                        // Minimal fallback from catalog array
                        if (window.ALL_PROMPTS) {
                            var item = window.ALL_PROMPTS.find(function (p) { return p.id == id; });
                            if (item) {
                                callback({
                                    id: item.id,
                                    title: item.title,
                                    category: item.category,
                                    thumbnail: item.thumbnail,
                                    promptText: 'Master prompt data available on full page view.'
                                });
                            }
                        }
                    });
            });
    };

    var openQuickView = function (id) {
        currentModalPromptId = parseInt(id, 10);
        var modalBackdrop = document.getElementById('quick-view-modal');
        if (!modalBackdrop) return;

        var titleEl = document.getElementById('modal-prompt-title');
        var catEl = document.getElementById('modal-prompt-cat');
        var dateEl = document.getElementById('modal-prompt-date');
        var codeEl = document.getElementById('modal-prompt-code');
        var imgEl = document.getElementById('modal-storyboard-img');
        var fullLinkEl = document.getElementById('modal-full-link');
        var copyBtn = document.getElementById('modal-copy-btn');

        if (titleEl) titleEl.textContent = 'Loading prompt #' + id + '…';
        if (codeEl) codeEl.textContent = 'Loading master prompt instructions…';
        if (imgEl) imgEl.src = 'assets/img/cover.jpg';
        if (fullLinkEl) fullLinkEl.href = 'prompts/' + id + '.html';

        modalBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';

        fetchPromptDetails(id, function (data) {
            if (currentModalPromptId !== parseInt(id, 10)) return;
            if (titleEl) titleEl.textContent = data.title || ('Prompt #' + data.id);
            if (catEl) catEl.textContent = data.category || 'General';
            if (dateEl) dateEl.textContent = data.updated || '2026 Collection';
            if (codeEl) codeEl.textContent = data.promptText || 'No prompt text found.';
            if (fullLinkEl) fullLinkEl.href = 'prompts/' + data.id + '.html';

            if (imgEl) {
                var galleryImg = (data.galleryImages && data.galleryImages.length > 0) ? data.galleryImages[0] : (data.thumbnail || 'assets/img/cover.jpg');
                imgEl.src = galleryImg;
                imgEl.onclick = function () {
                    if (window.openLightbox) window.openLightbox(galleryImg);
                };
            }

            if (copyBtn) {
                copyBtn.onclick = function () {
                    copyTextToClipboard(data.promptText, copyBtn);
                };
            }
        });
    };

    var closeQuickView = function () {
        var modalBackdrop = document.getElementById('quick-view-modal');
        if (modalBackdrop) {
            modalBackdrop.classList.remove('open');
            document.body.style.overflow = '';
        }
        currentModalPromptId = null;
    };

    var navigateQuickView = function (direction) {
        if (!window.ACTIVE_FILTERED_PROMPTS || window.ACTIVE_FILTERED_PROMPTS.length === 0) return;
        var list = window.ACTIVE_FILTERED_PROMPTS;
        var idx = list.findIndex(function (p) { return p.id === currentModalPromptId; });
        if (idx === -1) idx = 0;

        var nextIdx = idx + direction;
        if (nextIdx < 0) nextIdx = list.length - 1;
        if (nextIdx >= list.length) nextIdx = 0;

        openQuickView(list[nextIdx].id);
    };

    window.openQuickView = openQuickView;
    window.closeQuickView = closeQuickView;
    window.navigateQuickView = navigateQuickView;

    /* ─── Keyboard Shortcuts ─── */
    window.addEventListener('keydown', function (e) {
        var modalBackdrop = document.getElementById('quick-view-modal');
        var isModalOpen = modalBackdrop && modalBackdrop.classList.contains('open');

        if (e.key === 'Escape') {
            if (isModalOpen) {
                closeQuickView();
            } else if (window.closeLightbox) {
                window.closeLightbox();
            }
        } else if (isModalOpen) {
            if (e.key === 'ArrowLeft') {
                navigateQuickView(-1);
            } else if (e.key === 'ArrowRight') {
                navigateQuickView(1);
            }
        } else if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            if (e.key === '/') {
                var searchInput = document.getElementById('search-input');
                if (searchInput) {
                    e.preventDefault();
                    searchInput.focus();
                    searchInput.select();
                }
            } else if (e.key === 'ArrowLeft') {
                var prevLink = document.querySelector('.prompt-nav-btn.prev-btn');
                if (prevLink && prevLink.href) {
                    window.location.href = prevLink.href;
                }
            } else if (e.key === 'ArrowRight') {
                var nextLink = document.querySelector('.prompt-nav-btn.next-btn');
                if (nextLink && nextLink.href) {
                    window.location.href = nextLink.href;
                }
            }
        }
    });

    /* ─── Lightbox Viewer ─── */
    var lightbox = document.getElementById('lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'lightbox';
        lightbox.innerHTML = '<img id="lightbox-img" src="" alt="Enlarged reference">';
        lightbox.onclick = function () { lightbox.classList.remove('open'); };
        document.body.appendChild(lightbox);
    }

    window.openLightbox = function (src) {
        var img = document.getElementById('lightbox-img');
        if (img) img.src = src;
        lightbox.classList.add('open');
    };

    window.closeLightbox = function () {
        lightbox.classList.remove('open');
    };

    /* ─── Setup Copy Button on Prompt Detail Pages ─── */
    var detailCopyBtn = document.getElementById('copy-btn');
    if (detailCopyBtn) {
        detailCopyBtn.addEventListener('click', function () {
            var content = document.getElementById('prompt-content');
            if (content) copyTextToClipboard(content.innerText || content.textContent, detailCopyBtn);
        });
    }

    /* ─── Cover Banner Slider (Homepage) ─── */
    var slides = document.querySelectorAll('.cover-slider .cover-slide');
    if (slides.length > 1) {
        var startSlider = function () {
            slides.forEach(function (img) {
                if (img.dataset.src && !img.src) img.src = img.dataset.src;
            });
            var slideIdx = 0;
            setInterval(function () {
                slides[slideIdx].classList.remove('active');
                slideIdx = (slideIdx + 1) % slides.length;
                slides[slideIdx].classList.add('active');
            }, 5000);
        };
        if (document.readyState === 'complete') setTimeout(startSlider, 800);
        else window.addEventListener('load', function () { setTimeout(startSlider, 800); });
    }

    /* ─── Community Helpers ─── */
    document.querySelectorAll('.share-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var link = btn.dataset.link || window.location.href;
            copyTextToClipboard(link, btn);
        });
    });

    document.querySelectorAll('.composer-attach input[type=file]').forEach(function (inp) {
        inp.addEventListener('change', function () {
            var span = inp.parentElement.querySelector('.attach-name');
            if (inp.files.length) {
                var f = inp.files[0];
                if (f.size > 20 * 1024 * 1024) {
                    alert('File too large! Max 20MB allowed.');
                    inp.value = '';
                    if (span) span.textContent = '';
                    return;
                }
                if (span) span.textContent = ' ✓ ' + f.name;
            } else {
                if (span) span.textContent = '';
            }
        });
    });

})();
