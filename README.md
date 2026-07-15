# Product Sharer Stories

Extensão para Chrome/Brave que gera stories 9:16 a partir de produtos do Mercado Livre, Shopee e Magalu — com imagem, preço, título e QR Code com link de afiliado.

## Instalação

1. Abra `chrome://extensions` (ou `brave://extensions`)
2. Ative o **Modo desenvolvedor**
3. Clique em **Carregar extensão sem compactação**
4. Selecione esta pasta

## Configurar seus IDs de afiliado

Edite o arquivo `content.js` no topo do arquivo e substitua os valores pelos seus:

```js
var ML_ID = 'SEU_USUARIO_ML';        // matt_word (Mercado Livre)
var ML_TOOL = '14951425';            // matt_tool (geralmente fixo)
var SP_SOURCE = 'seu_codigo_shopee'; // utm_source (Shopee)
var MG_ID = 'seu_slug_magalu';       // slug da sua loja Magazine Você
```

### Como encontrar cada ID

#### Mercado Livre

O `ML_ID` é o parâmetro `matt_word` do programa de afiliados do Mercado Livre.

1. Acesse [afiliados.mercadolivre.com.br](https://afiliados.mercadolivre.com.br/)
2. Cadastre-se ou faça login
3. Ao criar um link de afiliado, o parâmetro `matt_word` é o identificador da sua conta
4. Copie o valor e cole em `ML_ID`

O `ML_TOOL` geralmente é fixo (`14951425`), mas pode ser encontrado na query string dos links gerados pelo programa de afiliados.

#### Shopee

O `SP_SOURCE` é o `utm_source` do programa de afiliados da Shopee (Shopee Affiliates).

1. Acesse [affiliate.shopee.com.br](https://affiliate.shopee.com.br/)
2. Cadastre-se no programa de afiliados
3. Ao gerar um link, ele terá o formato `?utm_source=an_XXXXXXXXXX&utm_medium=affiliates`
4. Copie o valor do `utm_source` (ex: `an_18348900080`) e cole em `SP_SOURCE`

#### Magalu (Magazine Você)

O `MG_ID` é o slug da sua loja no programa **Magazine Você**.

1. Acesse [magazinevoce.com.br](https://www.magazinevoce.com.br/)
2. Crie sua loja virtual (é gratuito)
3. O slug da sua loja aparece na URL: `magazinevoce.com.br/SEU_SLUG`
4. Copie o slug e cole em `MG_ID`

> **Importante:** ao gerar o story a partir da página de um produto no magazineluiza.com.br, o link gerado redireciona automaticamente para a sua loja no Magazine Você, mantendo o ID de afiliado.

## Como usar

1. Abra a página de um produto no ML, Shopee ou Magalu
2. Clique no ícone da extensão na barra de ferramentas
3. Clique em **Gerar Story 9:16**
4. Baixe a imagem ou copie o texto para colar no Instagram/Stories

## Lojas suportadas

| Loja | Domínios | Link de afiliado |
|------|----------|------------------|
| Mercado Livre | `mercadolivre.com.br`, `mercadolibre.com` | Direto com `matt_word` + `matt_tool` |
| Shopee | `shopee.com.br` | Direto com `utm_source` + `utm_medium` |
| Magalu | `magazineluiza.com.br`, `magazinevoce.com.br` | Via Magazine Você |
