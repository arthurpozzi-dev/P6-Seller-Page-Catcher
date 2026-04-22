/**
 * popup.js - Lógica do popup da extensão P6 Seller Page Catche
 * Suporta entrada manual de ASINs e visualização da planilha salva.
 */

document.addEventListener('DOMContentLoaded', () => {
  const VERIFICATION_BASE = 'https://sellercentral.amazon.com.br/interactive/listing/workflow/offer/offer';

  // Elementos do DOM: Bulk Check
  const asinInput = document.getElementById('asinInput');
  const asinCount = document.getElementById('asinCount');
  const btnCheck = document.getElementById('btnCheck');
  const btnClear = document.getElementById('btnClear');
  const feedback = document.getElementById('feedback');

  // Elementos do DOM: Abas
  const tabBtns = document.querySelectorAll('.tab-btn');
  const mainBulk = document.getElementById('tab-bulk');
  const mainSheet = document.getElementById('tab-sheet');
  const footerText = document.getElementById('footerText');

  // Elementos do DOM: Planilha
  const sheetList = document.getElementById('sheetList');
  const sheetCount = document.getElementById('sheetCount');
  const btnDownloadCsv = document.getElementById('btnDownloadCsv');
  const btnClearSheet = document.getElementById('btnClearSheet');

  // ===== LÓGICA DE ABAS =====
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (btn.dataset.target === 'tab-bulk') {
        mainBulk.style.display = 'flex';
        mainSheet.style.display = 'none';
        footerText.textContent = 'Cada ASIN abrirá uma aba de verificação no Seller Central';
        asinInput.focus();
      } else {
        mainBulk.style.display = 'none';
        mainSheet.style.display = 'flex';
        footerText.textContent = 'Gerencie as ofertas capturadas para análise';
        renderSheet();
      }
    });
  });

  // ===== LÓGICA BULK CHECK =====

  function parseAsins(text) {
    return text
      .split(/[\n,;\s]+/)
      .map(s => s.trim().toUpperCase())
      .filter(s => /^[A-Z0-9]{10}$/.test(s));
  }

  function updateCount() {
    const asins = parseAsins(asinInput.value);
    asinCount.textContent = `${asins.length} ASIN${asins.length !== 1 ? 's' : ''}`;
  }

  function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = `feedback feedback-${type}`;
    feedback.style.display = 'block';
    setTimeout(() => {
      feedback.style.display = 'none';
    }, 4000);
  }

  asinInput.addEventListener('input', updateCount);

  btnClear.addEventListener('click', () => {
    asinInput.value = '';
    updateCount();
    asinInput.focus();
  });

  btnCheck.addEventListener('click', () => {
    const asins = parseAsins(asinInput.value);

    if (asins.length === 0) {
      asinInput.classList.add('error');
      showFeedback('Nenhum ASIN válido encontrado.', 'error');
      setTimeout(() => asinInput.classList.remove('error'), 1500);
      return;
    }

    asins.forEach((asin, i) => {
      setTimeout(() => {
        chrome.tabs.create({
          url: `${VERIFICATION_BASE}?asin=${asin}&conditionType=new`,
          active: false
        });
      }, i * 150);
    });

    showFeedback(`✅ ${asins.length} aba${asins.length !== 1 ? 's' : ''} de verificação aberta${asins.length !== 1 ? 's' : ''}!`, 'success');
    btnCheck.classList.add('btn-success');
    setTimeout(() => btnCheck.classList.remove('btn-success'), 2000);
  });

  // ===== LÓGICA PLANILHA =====

  function renderSheet() {
    chrome.storage.local.get({ p6_spreadsheet: [] }, (result) => {
      const list = result.p6_spreadsheet;
      sheetList.innerHTML = '';
      sheetCount.textContent = `${list.length} item${list.length !== 1 ? 'ns' : ''} salvo${list.length !== 1 ? 's' : ''}`;

      if (list.length === 0) {
        sheetList.innerHTML = `
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Planilha vazia.<br>Adicione ofertas na página do Seller Central.
          </div>`;
        return;
      }

      list.forEach((item, index) => {
        let qtdColor = '#4ade80';
        if (item.qtd > 50) qtdColor = '#f87171';
        else if (item.qtd >= 11) qtdColor = '#facc15';

        const el = document.createElement('div');
        el.className = 'sheet-item';
        el.innerHTML = `
          <div class="sheet-info">
            <div class="sheet-title" title="${item.title}">${item.asin} - ${item.title}</div>
            <div class="sheet-details">
              <span><strong>R$</strong> ${item.price}</span>
              <span><strong>F:</strong> ${item.shipping}</span>
              <span class="sheet-badge" style="color: ${qtdColor}">${item.qtd} ofertas</span>
            </div>
          </div>
          <button class="btn-delete" data-index="${index}" title="Excluir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        `;

        el.querySelector('.btn-delete').addEventListener('click', () => {
          deleteItem(index);
        });

        sheetList.appendChild(el);
      });
    });
  }

  function deleteItem(index) {
    chrome.storage.local.get({ p6_spreadsheet: [] }, (result) => {
      const list = result.p6_spreadsheet;
      list.splice(index, 1);
      chrome.storage.local.set({ p6_spreadsheet: list }, () => {
        renderSheet();
      });
    });
  }

  btnClearSheet.addEventListener('click', () => {
    chrome.storage.local.set({ p6_spreadsheet: [] }, () => {
      renderSheet();
    });
  });

  btnDownloadCsv.addEventListener('click', () => {
    chrome.storage.local.get({ p6_spreadsheet: [] }, (result) => {
      const list = result.p6_spreadsheet;
      if (list.length === 0) return;

      const headers = ["Nome do Produto", "ASIN", "Link do Produto", "Link do Seller", "Quantidade de Anuncios", "Preco Vencedor", "Valor do frete vencedor"];
      
      const escapeCSV = (str) => {
        if (str === null || str === undefined) return '""';
        const s = String(str).replace(/"/g, '""');
        return `"${s}"`;
      };

      const rows = list.map(item => [
        escapeCSV(item.title),
        escapeCSV(item.asin),
        escapeCSV(item.productLink),
        escapeCSV(item.sellerLink),
        escapeCSV(item.qtd),
        escapeCSV(item.price),
        escapeCSV(item.shipping)
      ].join(','));

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(',') + "\n" + rows.join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `p6_produtos_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });

  // Init
  asinInput.focus();
});
