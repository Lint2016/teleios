/**
 * Bible Verse Popup
 * Automatically detects Bible verse references anywhere on the page,
 * wraps them in interactive spans, and shows the full verse text
 * in a beautiful tooltip when hovered/tapped.
 *
 * Uses the free bible-api.com (KJV) - no API key required.
 */

(function () {
  'use strict';

  // ── Configuration ──────────────────────────────────────────────────────────
  const BIBLE_VERSION = 'kjv'; // kjv | web | bbe | clementine | almeida | rccv
  const API_BASE = `https://bible-api.com/`;
  const TOOLTIP_ID = 'bvp-tooltip';

  // Book name aliases → canonical API name (bible-api.com accepts many forms)
  const BOOK_ALIASES = {
    'gen': 'genesis', 'genesis': 'genesis',
    'ex': 'exodus', 'exo': 'exodus', 'exodus': 'exodus',
    'lev': 'leviticus', 'leviticus': 'leviticus',
    'num': 'numbers', 'numbers': 'numbers',
    'deut': 'deuteronomy', 'deu': 'deuteronomy', 'deuteronomy': 'deuteronomy',
    'josh': 'joshua', 'joshua': 'joshua',
    'judg': 'judges', 'judges': 'judges',
    'ruth': 'ruth',
    '1sam': '1+samuel', '1 sam': '1+samuel', '1samuel': '1+samuel', '1 samuel': '1+samuel',
    '2sam': '2+samuel', '2 sam': '2+samuel', '2samuel': '2+samuel', '2 samuel': '2+samuel',
    '1kgs': '1+kings', '1 kgs': '1+kings', '1kings': '1+kings', '1 kings': '1+kings',
    '2kgs': '2+kings', '2 kgs': '2+kings', '2kings': '2+kings', '2 kings': '2+kings',
    '1chr': '1+chronicles', '1 chr': '1+chronicles', '1chronicles': '1+chronicles',
    '2chr': '2+chronicles', '2 chr': '2+chronicles', '2chronicles': '2+chronicles',
    'ezra': 'ezra', 'neh': 'nehemiah', 'nehemiah': 'nehemiah',
    'esth': 'esther', 'esther': 'esther',
    'job': 'job',
    'ps': 'psalms', 'psa': 'psalms', 'psalm': 'psalms', 'psalms': 'psalms',
    'prov': 'proverbs', 'pro': 'proverbs', 'proverbs': 'proverbs',
    'eccl': 'ecclesiastes', 'ecc': 'ecclesiastes', 'ecclesiastes': 'ecclesiastes',
    'song': 'song+of+solomon', 'sos': 'song+of+solomon',
    'isa': 'isaiah', 'isaiah': 'isaiah',
    'jer': 'jeremiah', 'jeremiah': 'jeremiah',
    'lam': 'lamentations', 'lamentations': 'lamentations',
    'ezek': 'ezekiel', 'eze': 'ezekiel', 'ezekiel': 'ezekiel',
    'dan': 'daniel', 'daniel': 'daniel',
    'hos': 'hosea', 'hosea': 'hosea',
    'joel': 'joel', 'amos': 'amos', 'obad': 'obadiah', 'obadiah': 'obadiah',
    'jonah': 'jonah', 'jon': 'jonah',
    'mic': 'micah', 'micah': 'micah', 'nah': 'nahum', 'nahum': 'nahum',
    'hab': 'habakkuk', 'habakkuk': 'habakkuk',
    'zeph': 'zephaniah', 'zephaniah': 'zephaniah',
    'hag': 'haggai', 'haggai': 'haggai',
    'zech': 'zechariah', 'zec': 'zechariah', 'zechariah': 'zechariah',
    'mal': 'malachi', 'malachi': 'malachi',
    'matt': 'matthew', 'mat': 'matthew', 'matthew': 'matthew',
    'mark': 'mark', 'mrk': 'mark',
    'luke': 'luke', 'luk': 'luke',
    'john': 'john', 'jhn': 'john',
    'acts': 'acts',
    'rom': 'romans', 'romans': 'romans',
    '1cor': '1+corinthians', '1 cor': '1+corinthians', '1corinthians': '1+corinthians', '1 corinthians': '1+corinthians',
    '2cor': '2+corinthians', '2 cor': '2+corinthians', '2corinthians': '2+corinthians', '2 corinthians': '2+corinthians',
    'gal': 'galatians', 'galatians': 'galatians',
    'eph': 'ephesians', 'ephesians': 'ephesians',
    'phil': 'philippians', 'php': 'philippians', 'philippians': 'philippians',
    'col': 'colossians', 'colossians': 'colossians',
    '1thess': '1+thessalonians', '1 thess': '1+thessalonians', '1thessalonians': '1+thessalonians',
    '2thess': '2+thessalonians', '2 thess': '2+thessalonians', '2thessalonians': '2+thessalonians',
    '1tim': '1+timothy', '1 tim': '1+timothy', '1timothy': '1+timothy', '1 timothy': '1+timothy',
    '2tim': '2+timothy', '2 tim': '2+timothy', '2timothy': '2+timothy', '2 timothy': '2+timothy',
    'titus': 'titus', 'tit': 'titus',
    'phlm': 'philemon', 'philemon': 'philemon',
    'heb': 'hebrews', 'hebrews': 'hebrews',
    'jas': 'james', 'james': 'james',
    '1pet': '1+peter', '1 pet': '1+peter', '1peter': '1+peter', '1 peter': '1+peter',
    '2pet': '2+peter', '2 pet': '2+peter', '2peter': '2+peter', '2 peter': '2+peter',
    '1john': '1+john', '1 john': '1+john', '1jn': '1+john',
    '2john': '2+john', '2 john': '2+john', '2jn': '2+john',
    '3john': '3+john', '3 john': '3+john', '3jn': '3+john',
    'jude': 'jude',
    'rev': 'revelation', 'revelation': 'revelation',
  };

  // ── Regex: matches e.g. "Hebrews 6:1", "John 3:16-17", "1 Cor 13:4"
  const VERSE_REGEX = /\b((?:\d\s)?[A-Za-z]+(?:\s[A-Za-z]+)?)\s(\d+):(\d+)(?:-(\d+))?\b/g;

  // ── Cache for API responses ─────────────────────────────────────────────────
  const cache = {};

  // ── Tooltip element ─────────────────────────────────────────────────────────
  let tooltip;

  function createTooltip() {
    tooltip = document.createElement('div');
    tooltip.id = TOOLTIP_ID;
    tooltip.setAttribute('role', 'tooltip');
    tooltip.innerHTML = `
      <div class="bvp-header">
        <span class="bvp-ref"></span>
        <span class="bvp-version">KJV</span>
      </div>
      <div class="bvp-body">
        <div class="bvp-loading"><span></span><span></span><span></span></div>
        <p class="bvp-text"></p>
      </div>
    `;
    document.body.appendChild(tooltip);
  }

  // Detect touch/mobile to use fixed positioning (avoids scroll-offset issues)
  const isTouchDevice = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  function positionTooltip(anchorEl) {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const tooltipW = tooltip.offsetWidth || 320;
    const gap = 10;

    if (isTouchDevice()) {
      // On mobile: use fixed positioning relative to viewport
      tooltip.style.position = 'fixed';
      let top = rect.bottom + gap;
      let left = rect.left + rect.width / 2 - tooltipW / 2;

      // Keep within viewport horizontally
      const maxLeft = window.innerWidth - tooltipW - 16;
      left = Math.max(16, Math.min(left, maxLeft));

      // Flip above if too close to bottom of viewport
      const tooltipH = tooltip.offsetHeight || 160;
      if (top + tooltipH > window.innerHeight - 16) {
        top = rect.top - tooltipH - gap;
      }

      // Ensure it never goes off the top
      if (top < 10) top = 10;

      tooltip.style.top = top + 'px';
      tooltip.style.left = left + 'px';
    } else {
      // On desktop: use absolute positioning with scroll offset
      tooltip.style.position = 'absolute';
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;
      let top = rect.bottom + scrollY + gap;
      let left = rect.left + scrollX + rect.width / 2 - tooltipW / 2;

      // Keep within viewport horizontally
      const maxLeft = window.innerWidth - tooltipW - 16;
      left = Math.max(16, Math.min(left, maxLeft));

      // Flip above if too close to bottom
      if (rect.bottom + 160 > window.innerHeight) {
        top = rect.top + scrollY - tooltip.offsetHeight - gap;
      }

      tooltip.style.top = top + 'px';
      tooltip.style.left = left + 'px';
    }
  }

  function showTooltip(anchorEl, ref, apiQuery) {
    tooltip.classList.remove('bvp-visible', 'bvp-error');
    tooltip.querySelector('.bvp-ref').textContent = ref;
    tooltip.querySelector('.bvp-text').textContent = '';
    tooltip.querySelector('.bvp-loading').style.display = 'flex';
    tooltip.classList.add('bvp-visible');
    positionTooltip(anchorEl);

    if (cache[apiQuery]) {
      renderVerse(cache[apiQuery]);
      return;
    }

    const url = `${API_BASE}${apiQuery}?translation=${BIBLE_VERSION}`;
    fetch(url, { mode: 'cors' })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        const text = data.verses
          ? data.verses.map(v => v.text.trim()).join(' ')
          : (data.text || '').trim();
        cache[apiQuery] = text || 'Verse text not available.';
        renderVerse(cache[apiQuery]);
      })
      .catch(err => {
        // Do NOT cache errors — allow the user to retry by tapping again
        tooltip.classList.add('bvp-error');
        const errorMsg = navigator.onLine
          ? '⚠ Could not load verse. The scripture service may be temporarily unavailable.'
          : '⚠ No internet connection. Please connect and tap again.';
        renderVerse(errorMsg);
      });
  }

  function renderVerse(text) {
    tooltip.querySelector('.bvp-loading').style.display = 'none';
    tooltip.querySelector('.bvp-text').textContent = `"${text}"`;
    if (tooltip._anchor) positionTooltip(tooltip._anchor);
  }

  function hideTooltip() {
    tooltip.classList.remove('bvp-visible');
    tooltip._anchor = null;
  }

  // ── Text node scanner ───────────────────────────────────────────────────────
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'A', 'SPAN']);

  function scanNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!VERSE_REGEX.test(text)) return;
      VERSE_REGEX.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      let match;
      VERSE_REGEX.lastIndex = 0;

      while ((match = VERSE_REGEX.exec(text)) !== null) {
        const [fullMatch, book, chapter, verseStart, verseEnd] = match;
        const bookKey = book.toLowerCase().replace(/\s+/g, ' ').trim();
        const canonicalBook = BOOK_ALIASES[bookKey];
        if (!canonicalBook) continue;

        // Text before this match
        if (match.index > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }

        // Build API query
        const verseRange = verseEnd ? `${verseStart}-${verseEnd}` : verseStart;
        const apiQuery = `${canonicalBook}+${chapter}:${verseRange}`;
        const displayRef = fullMatch;

        // Create interactive span
        const span = document.createElement('span');
        span.className = 'bvp-trigger';
        span.setAttribute('tabindex', '0');
        span.setAttribute('role', 'button');
        span.setAttribute('aria-label', `View Bible verse ${displayRef}`);
        span.dataset.apiQuery = apiQuery;
        span.dataset.ref = displayRef;
        span.textContent = fullMatch;

        frag.appendChild(span);
        lastIndex = match.index + fullMatch.length;
      }

      // Remaining text
      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      // Only replace if we actually found matches
      if (frag.childNodes.length > 1 || (frag.childNodes.length === 1 && frag.firstChild.nodeType !== Node.TEXT_NODE)) {
        node.parentNode.replaceChild(frag, node);
      }
      return;
    }

    // Recurse into child nodes, skipping certain tags
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (SKIP_TAGS.has(node.tagName) || node.classList.contains('bvp-trigger')) return;
      // Collect children first to avoid live NodeList issues
      const children = Array.from(node.childNodes);
      children.forEach(scanNode);
    }
  }

  // ── Event delegation ────────────────────────────────────────────────────────
  function setupEvents() {
    let hideTimer;

    document.addEventListener('mouseover', e => {
      const trigger = e.target.closest('.bvp-trigger');
      if (!trigger) return;
      clearTimeout(hideTimer);
      tooltip._anchor = trigger;
      showTooltip(trigger, trigger.dataset.ref, trigger.dataset.apiQuery);
    });

    document.addEventListener('mouseout', e => {
      const trigger = e.target.closest('.bvp-trigger');
      if (!trigger) return;
      hideTimer = setTimeout(() => {
        if (!tooltip.matches(':hover')) hideTooltip();
      }, 200);
    });

    tooltip.addEventListener('mouseleave', () => {
      hideTimer = setTimeout(hideTooltip, 200);
    });

    tooltip.addEventListener('mouseenter', () => clearTimeout(hideTimer));

    // Keyboard: Enter / Space to show, Escape to hide
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { hideTooltip(); return; }
      const trigger = e.target.closest('.bvp-trigger');
      if (!trigger) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tooltip._anchor = trigger;
        showTooltip(trigger, trigger.dataset.ref, trigger.dataset.apiQuery);
      }
    });

    // Touch devices: tap to toggle
    document.addEventListener('click', e => {
      const trigger = e.target.closest('.bvp-trigger');
      if (trigger) {
        e.stopPropagation();
        if (tooltip.classList.contains('bvp-visible') && tooltip._anchor === trigger) {
          hideTooltip();
        } else {
          tooltip._anchor = trigger;
          showTooltip(trigger, trigger.dataset.ref, trigger.dataset.apiQuery);
        }
        return;
      }
      if (!tooltip.contains(e.target)) hideTooltip();
    });
  }

  // ── Inject styles ───────────────────────────────────────────────────────────
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .bvp-trigger {
        color: #c9a84c;
        border-bottom: 1px dashed #c9a84c88;
        cursor: pointer;
        transition: color 0.2s, border-color 0.2s;
        border-radius: 2px;
        padding: 0 1px;
      }
      .bvp-trigger:hover,
      .bvp-trigger:focus {
        color: #e8c66a;
        border-bottom-color: #e8c66a;
        outline: none;
        background: rgba(201,168,76,0.1);
      }

      #${TOOLTIP_ID} {
        position: absolute;
        z-index: 99999;
        width: 320px;
        max-width: calc(100vw - 32px);
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 1px solid rgba(201,168,76,0.35);
        border-radius: 14px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.1);
        padding: 0;
        opacity: 0;
        transform: translateY(6px) scale(0.97);
        pointer-events: none;
        transition: opacity 0.22s ease, transform 0.22s ease;
        backdrop-filter: blur(12px);
        overflow: hidden;
      }
      #${TOOLTIP_ID}.bvp-visible {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .bvp-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 16px 8px;
        background: rgba(201,168,76,0.12);
        border-bottom: 1px solid rgba(201,168,76,0.2);
      }
      .bvp-ref {
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 600;
        font-size: 0.95rem;
        color: #c9a84c;
        letter-spacing: 0.02em;
      }
      .bvp-version {
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.1em;
        color: rgba(201,168,76,0.7);
        background: rgba(201,168,76,0.15);
        padding: 2px 7px;
        border-radius: 20px;
        text-transform: uppercase;
      }
      .bvp-body {
        padding: 12px 16px 14px;
        min-height: 60px;
      }
      .bvp-text {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 0.92rem;
        line-height: 1.65;
        color: #e8e8f0;
        margin: 0;
        font-style: italic;
      }
      #${TOOLTIP_ID}.bvp-error .bvp-text {
        font-style: normal;
        color: #f08080;
        font-size: 0.85rem;
        font-family: 'Inter', sans-serif;
      }

      /* Animated loading dots */
      .bvp-loading {
        display: flex;
        gap: 6px;
        align-items: center;
        padding: 4px 0 8px;
      }
      .bvp-loading span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #c9a84c;
        animation: bvp-bounce 1.2s infinite ease-in-out;
      }
      .bvp-loading span:nth-child(1) { animation-delay: 0s; }
      .bvp-loading span:nth-child(2) { animation-delay: 0.18s; }
      .bvp-loading span:nth-child(3) { animation-delay: 0.36s; }
      @keyframes bvp-bounce {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Init ────────────────────────────────────────────────────────────────────
  function init() {
    injectStyles();
    createTooltip();
    setupEvents();

    // Scan the whole page after content settles
    setTimeout(() => scanNode(document.body), 800);

    // Also watch for dynamically loaded content (e.g. sermon cards loaded by JS)
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        m.addedNodes.forEach(n => {
          if (n.nodeType === Node.ELEMENT_NODE) scanNode(n);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
