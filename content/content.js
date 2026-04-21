/**
 * content.js - P6 Seller Page Catche
 * Content script para páginas da Amazon
 *
 * Funcionalidades:
 * 1. Página de produto: botão flutuante para verificar ASIN
 * 2. Vitrine de vendedor: link de verificação ao lado de cada produto
 * 3. Vitrine de vendedor: toolbar copiar ASINs + abrir todas em massa
 * 4. Popup "Todas as Ofertas": copiar/abrir vitrines de todos os sellers
 */

(function () {
  'use strict';

  const VERIFICATION_BASE = 'https://sellercentral.amazon.com.br/interactive/listing/workflow/offer/offer';

  function getVerificationUrl(asin) {
    return `${VERIFICATION_BASE}?asin=${asin}&conditionType=new`;
  }

  function getStorefrontUrl(sellerId) {
    return `https://www.amazon.com.br/s?me=${sellerId}`;
  }

  // ===== DETECÇÃO DE TIPO DE PÁGINA =====

  function extractAsinFromUrl() {
    const url = window.location.href;
    const patterns = [
      /\/dp\/([A-Z0-9]{10})/i,
      /\/gp\/product\/([A-Z0-9]{10})/i,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1].toUpperCase();
    }
    return null;
  }

  function isProductPage() {
    return extractAsinFromUrl() !== null;
  }

  function isStorefrontPage() {
    const params = new URLSearchParams(window.location.search);
    return params.has('me');
  }

  // ===== 1. PÁGINA DE PRODUTO: BOTÃO FLUTUANTE =====

  function injectFloatingButton(asin) {
    if (document.getElementById('p6-float-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'p6-float-btn';
    btn.title = `Verificar ASIN ${asin}`;
    btn.innerHTML = `
      <svg class="p6-float-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 14l2 2 4-4"/>
      </svg>
      <span class="p6-float-text">Verificar <strong>${asin}</strong></span>
    `;

    btn.addEventListener('click', () => {
      window.open(getVerificationUrl(asin), '_blank');
    });

    document.body.appendChild(btn);
  }

  // ===== 2. VITRINE: LINKS POR PRODUTO =====

  function getAllProductAsins() {
    const items = document.querySelectorAll('[data-asin]');
    const asins = [];
    items.forEach(item => {
      const asin = item.getAttribute('data-asin');
      if (asin && /^[A-Z0-9]{10}$/i.test(asin)) {
        asins.push(asin.toUpperCase());
      }
    });
    return [...new Set(asins)];
  }

  function injectProductLinks() {
    const items = document.querySelectorAll('[data-asin]');
    items.forEach(item => {
      if (item.querySelector('.p6-check-link')) return;

      const asin = item.getAttribute('data-asin');
      if (!asin || !/^[A-Z0-9]{10}$/i.test(asin)) return;

      const link = document.createElement('a');
      link.className = 'p6-check-link';
      link.href = getVerificationUrl(asin.toUpperCase());
      link.target = '_blank';
      link.rel = 'noopener';
      link.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="M9 14l2 2 4-4"/>
        </svg>
        Verificar ${asin}
      `;

      const titleEl = item.querySelector('h2');
      if (titleEl) {
        titleEl.parentElement.insertBefore(link, titleEl.nextSibling);
      } else {
        item.appendChild(link);
      }
    });
  }

  // ===== 3. VITRINE: TOOLBAR (COPIAR + ABRIR TODAS) =====

  function injectStorefrontToolbar() {
    if (document.getElementById('p6-toolbar')) return;

    const toolbar = document.createElement('div');
    toolbar.id = 'p6-toolbar';
    toolbar.innerHTML = `
      <div class="p6-toolbar-inner">
        <div class="p6-toolbar-brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span class="p6-toolbar-title">P6 Catche</span>
          <span class="p6-toolbar-count" id="p6-count">0 ASINs</span>
        </div>
        <div class="p6-toolbar-actions">
          <button class="p6-toolbar-btn p6-btn-copy" id="p6-copy-all" title="Copiar todas as ASINs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            <span>Copiar ASINs</span>
          </button>
          <button class="p6-toolbar-btn p6-btn-open" id="p6-open-all" title="Abrir todas as verificações">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            <span>Abrir Todas</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(toolbar);
    updateToolbarCount();

    document.getElementById('p6-copy-all').addEventListener('click', () => {
      const asins = getAllProductAsins();
      navigator.clipboard.writeText(asins.join('\n')).then(() => {
        flashButton('p6-copy-all', '✅ Copiado!');
      });
    });

    document.getElementById('p6-open-all').addEventListener('click', () => {
      const asins = getAllProductAsins();
      if (asins.length === 0) return;
      chrome.runtime.sendMessage({
        action: 'openTabs',
        urls: asins.map(a => getVerificationUrl(a))
      });
      flashButton('p6-open-all', `✅ ${asins.length} abas!`);
    });
  }

  function updateToolbarCount() {
    const el = document.getElementById('p6-count');
    if (el) {
      const asins = getAllProductAsins();
      el.textContent = `${asins.length} ASIN${asins.length !== 1 ? 's' : ''}`;
    }
  }

  // ===== 4. POPUP "TODAS AS OFERTAS": SELLERS =====

  function extractSellerIds() {
    const scroller = document.getElementById('all-offers-display-scroller');
    if (!scroller) return [];

    const links = scroller.querySelectorAll('a[href*="seller="]');
    const sellerIds = [];

    links.forEach(link => {
      const href = link.getAttribute('href');
      const match = href.match(/seller=([A-Z0-9]+)/i);
      if (match && match[1]) {
        sellerIds.push(match[1]);
      }
    });

    return [...new Set(sellerIds)];
  }

  function injectOffersToolbar() {
    if (document.getElementById('p6-offers-toolbar')) return;

    const scroller = document.getElementById('all-offers-display-scroller');
    if (!scroller) return;

    const sellerIds = extractSellerIds();
    if (sellerIds.length === 0) return;

    const toolbar = document.createElement('div');
    toolbar.id = 'p6-offers-toolbar';
    toolbar.innerHTML = `
      <div class="p6-offers-inner">
        <div class="p6-offers-brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <span class="p6-offers-title">P6 Catche</span>
          <span class="p6-offers-count">${sellerIds.length} seller${sellerIds.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="p6-offers-actions">
          <button class="p6-toolbar-btn p6-btn-copy" id="p6-copy-sellers" title="Copiar links das vitrines">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            <span>Copiar Vitrines</span>
          </button>
          <button class="p6-toolbar-btn p6-btn-open" id="p6-open-sellers" title="Abrir todas as vitrines">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            <span>Abrir Todas</span>
          </button>
        </div>
      </div>
    `;

    // Inserir antes do scroller
    scroller.parentElement.insertBefore(toolbar, scroller);

    document.getElementById('p6-copy-sellers').addEventListener('click', () => {
      const ids = extractSellerIds();
      const urls = ids.map(id => getStorefrontUrl(id)).join('\n\n');
      navigator.clipboard.writeText(urls).then(() => {
        flashButton('p6-copy-sellers', '✅ Copiado!');
      });
    });

    document.getElementById('p6-open-sellers').addEventListener('click', () => {
      const ids = extractSellerIds();
      if (ids.length === 0) return;
      chrome.runtime.sendMessage({
        action: 'openTabs',
        urls: ids.map(id => getStorefrontUrl(id))
      });
      flashButton('p6-open-sellers', `✅ ${ids.length} abas!`);
    });
  }

  // ===== UTILIDADES =====

  function flashButton(btnId, message) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const original = btn.innerHTML;
    btn.innerHTML = `<span>${message}</span>`;
    btn.classList.add('p6-btn-success');
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('p6-btn-success');
    }, 2500);
  }

  // ===== INICIALIZAÇÃO =====

  function init() {
    // Página de produto: botão flutuante
    if (isProductPage()) {
      const asin = extractAsinFromUrl();
      if (asin) injectFloatingButton(asin);
    }

    // Vitrine de vendedor: links + toolbar
    if (isStorefrontPage()) {
      injectProductLinks();
      injectStorefrontToolbar();
    }

    // Popup "Todas as Ofertas": sellers
    checkForAllOffersPopup();
  }

  function checkForAllOffersPopup() {
    const scroller = document.getElementById('all-offers-display-scroller');
    if (scroller && !document.getElementById('p6-offers-toolbar')) {
      // Pequeno delay para garantir que os sellers carregaram
      setTimeout(() => {
        injectOffersToolbar();
      }, 800);
    }
  }

  init();

  // Observador para conteúdo dinâmico, navegação SPA e popup de ofertas
  let lastUrl = location.href;
  let debounceTimer = null;

  const observer = new MutationObserver(() => {
    // Navegação SPA
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      const oldBtn = document.getElementById('p6-float-btn');
      if (oldBtn) oldBtn.remove();
      const oldToolbar = document.getElementById('p6-toolbar');
      if (oldToolbar) oldToolbar.remove();
      const oldOffers = document.getElementById('p6-offers-toolbar');
      if (oldOffers) oldOffers.remove();
      setTimeout(init, 1000);
      return;
    }

    // Detectar popup de "Todas as Ofertas" aparecendo
    checkForAllOffersPopup();

    // Atualizar vitrine quando novos produtos carregam
    if (isStorefrontPage()) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        injectProductLinks();
        updateToolbarCount();
      }, 500);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
