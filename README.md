# P6 Seller Page Catche

**P6 Seller Page Catche** é uma extensão avançada para Google Chrome projetada para agilizar o fluxo de trabalho de vendedores na Amazon Brasil. Ela automatiza a coleta de ASINs, links de vitrines de concorrentes e facilita a verificação de restrições no Amazon Seller Central.

![Design Premium](https://img.shields.io/badge/Design-Premium-red?style=for-the-badge)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-black?style=for-the-badge)

---

## 🚀 Funcionalidades Principais

### 1. 🎯 Verificação Rápida de Produto (Página de Detalhes)
Ao entrar em qualquer página de produto da Amazon, um botão flutuante premium aparecerá no canto inferior direito.
- **Ação:** Redireciona instantaneamente para a página de criação de oferta no Seller Central com a ASIN preenchida.

### 2. 🏪 Scanner de Vitrine de Vendedores
Ao navegar na vitrine (storefront) de qualquer vendedor:
- **Links Individuais:** Um link de verificação direta é injetado ao lado de cada produto da listagem.
- **Toolbar de Ações em Massa:** Uma barra fixa no rodapé detecta todos os produtos da página e oferece:
  - **Copiar ASINs:** Copia todas as ASINs da página para o clipboard (uma por linha).
  - **Abrir Todas:** Abre uma nova aba para cada ASIN diretamente na página de verificação do Seller Central.

### 3. 🔍 Capturador de Concorrentes (Menu de Ofertas)
Ao abrir o popup lateral da Amazon que lista "Todas as Ofertas" (concorrentes da BuyBox):
- Uma toolbar exclusiva é injetada no topo da lista.
- **Copiar Vitrines:** Extrai o ID de todos os vendedores concorrentes e gera links formatados das vitrines.
- **Abrir Todas:** Abre as vitrines de todos os concorrentes em novas abas para análise rápida.

### 4. ⌨️ Entrada Manual e Bulk (Popup da Extensão)
Clique no ícone da extensão para abrir o painel principal:
- **Input de Área de Texto:** Cole uma lista de ASINs manualmente.
- **Processamento Inteligente:** Limpa e formata os dados automaticamente.
- **Ação:** Abre todas as abas de verificação de uma só vez.


## 🛠️ Como Instalar (Desenvolvedor)

Como esta é uma ferramenta de uso privado/especializado, siga os passos abaixo para instalar:

1. Faça o download ou clone este repositório.
2. No Google Chrome, acesse `chrome://extensions/`.
3. Ative o **"Modo do desenvolvedor"** no canto superior direito.
4. Clique em **"Carregar sem compactação"**.
5. Selecione a pasta raiz do projeto (`amazon-asin-checker` ou o nome que você deu à pasta).
6. Pronto! O ícone do **P6 Catche** aparecerá na sua barra de extensões.

---

## 📂 Estrutura do Projeto

```text
├── background/
│   └── service-worker.js    # Gerenciamento de abas e processos em background
├── content/
│   ├── content.js          # Lógica de injeção no DOM da Amazon
│   └── content.css         # Estilização dos elementos injetados (Toolbar/Botões)
├── popup/
│   ├── popup.html          # Interface do usuário principal
│   ├── popup.js            # Lógica do painel de input manual
│   └── popup.css           # Estilos do painel principal
├── icons/                  # Ativos visuais da extensão
└── manifest.json           # Configurações e permissões da extensão
```

---

## 📝 Notas de Uso
- Certifique-se de estar logado no seu **Amazon Seller Central** para que os links de verificação funcionem corretamente.
- A ferramenta foi otimizada para o marketplace **amazon.com.br**, mas possui compatibilidade base para **amazon.com**.

---
*Desenvolvido para alta performance em arbitragem e análise de mercado.*
