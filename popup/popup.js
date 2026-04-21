/**
 * popup.js - Lógica do popup da extensão P6 Seller Page Catche
 * Simples: parseia ASINs do textarea e abre abas de verificação.
 */

document.addEventListener('DOMContentLoaded', () => {
  const VERIFICATION_BASE = 'https://sellercentral.amazon.com.br/interactive/listing/workflow/offer/offer';

  const asinInput = document.getElementById('asinInput');
  const asinCount = document.getElementById('asinCount');
  const btnCheck = document.getElementById('btnCheck');
  const btnClear = document.getElementById('btnClear');
  const feedback = document.getElementById('feedback');

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

  // Atualizar contagem ao digitar
  asinInput.addEventListener('input', updateCount);

  // Limpar textarea
  btnClear.addEventListener('click', () => {
    asinInput.value = '';
    updateCount();
    asinInput.focus();
  });

  // Verificar ASINs - abrir abas
  btnCheck.addEventListener('click', () => {
    const asins = parseAsins(asinInput.value);

    if (asins.length === 0) {
      asinInput.classList.add('error');
      showFeedback('Nenhum ASIN válido encontrado. Use o formato B0XXXXXXXXX.', 'error');
      setTimeout(() => asinInput.classList.remove('error'), 1500);
      return;
    }

    // Abrir uma aba por ASIN
    asins.forEach((asin, i) => {
      setTimeout(() => {
        chrome.tabs.create({
          url: `${VERIFICATION_BASE}?asin=${asin}&conditionType=new`,
          active: false
        });
      }, i * 150);
    });

    // Feedback visual
    showFeedback(`✅ ${asins.length} aba${asins.length !== 1 ? 's' : ''} de verificação aberta${asins.length !== 1 ? 's' : ''}!`, 'success');
    btnCheck.classList.add('btn-success');
    setTimeout(() => btnCheck.classList.remove('btn-success'), 2000);
  });

  // Focar no textarea ao abrir
  asinInput.focus();
});
