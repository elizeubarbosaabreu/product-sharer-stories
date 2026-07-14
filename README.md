# Product Sharer Stories

Extensão para Google Chrome (Manifest V3) que gera imagens no formato **stories 9:16** (1080x1920px) para compartilhar produtos de e-commerce diretamente no Instagram, WhatsApp ou outras plataformas.

## Funcionalidades

- Extração automática de dados do produto (título, preço, imagem)
- Geração de imagem story com gradiente escuro, imagem do produto, preço em destaque e QR Code com link de afiliado
- Download da imagem em PNG ou cópia do texto com link para a área de transferência
- Suporte a múltiplas lojas com links de afiliado configurados

## Lojas Suportadas

| Loja | Domínios |
|------|----------|
| Mercado Livre | `mercadolivre.com.br`, `mercadolibre.com` |
| Shopee | `shopee.com.br` |
| Magazine Luiza | `magazineluiza.com.br`, `magazinevoce.com.br` |

## Como Instalar

1. Abra `chrome://extensions/` no Google Chrome
2. Ative o **Modo do desenvolvedor**
3. Clique em **Carregar extensão sem empacotamento**
4. Selecione a pasta `product-sharer-stories`
5. Pronto! O ícone da extensão aparecerá na barra de ferramentas

## Como Usar

1. Navegue até uma página de produto em uma loja suportada
2. Clique no ícone da extensão na barra de ferramentas
3. O popup abre e extrai os dados do produto automaticamente
4. Clique em **Gerar Story 9:16** para criar a imagem
5. Use **Baixar Imagem** para salvar o PNG ou **Copiar Texto** para copiar a descrição com link

## Estrutura do Projeto

```
product-sharer-stories/
  manifest.json      # Manifest V3 da extensão
  popup.html         # Interface popup (tema escuro)
  popup.js           # Lógica principal: geração de canvas e exportação
  content.js         # Extração de dados do produto por loja
  background.js      # Service Worker: busca de imagens (CORS bypass)
  qrcode.js          # Biblioteca QR Code embutida
  icons/
    icon-48.png
    icon-128.png
```

## Tecnologias

- HTML/CSS
- JavaScript vanilla (sem frameworks)
- Canvas API
- Chrome Extensions API (Manifest V3)

## Licença

MIT
