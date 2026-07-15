var ML_ID = 'elizeubarbosaabreu';
var ML_TOOL = '14951425';
var SP_SOURCE = 'an_18348900080';
var MG_ID = 'magazinematapreco';
var C24_AFFILIATE = 'promocao40216';

function detectStore() {
  var host = window.location.hostname;
  if (host.includes('mercadolivre.com.br') || host.includes('mercadolibre.com')) return 'ml';
  if (host.includes('shopee.com.br')) return 'shopee';
  if (host.includes('magazineluiza.com.br') || host.includes('magazinevoce.com.br')) return 'magalu';
  if (host.includes('cursos24horas.com.br')) return 'c24';
  return null;
}

function extractML() {
  var title = '';
  var price = '';
  var desc = '';
  var img = '';
  var allImages = [];
  var link = window.location.href.split('#')[0];

  var titleEl = document.querySelector('h1.ui-pdp-title');
  if (titleEl) title = titleEl.textContent.trim();

  var priceEl = document.querySelector('.ui-pdp-price__second-line .andes-money-amount__fraction');
  if (priceEl) price = priceEl.textContent.trim();

  var centsEl = document.querySelector('.ui-pdp-price__second-line .andes-money-amount__cents');
  if (centsEl && price) price = price + ',' + centsEl.textContent.trim();

  var descEl = document.querySelector('.ui-pdp-specs__table__column--value') ||
               document.querySelector('.ui-vpp-highlighted-specs__attribute-specs') ||
               document.querySelector('.ui-pdp-description');
  if (descEl) desc = descEl.textContent.trim().substring(0, 150);

  if (!title) {
    var h1 = document.querySelector('h1');
    if (h1) title = h1.textContent.trim();
  }

  var seen = {};
  function addImg(src) {
    if (!src) return;
    if (!seen[src]) { seen[src] = true; allImages.push(src); }
  }

  var ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg) addImg(ogImg.getAttribute('content'));

  var galleryImgs = document.querySelectorAll('.ui-pdp-gallery__figure__img');
  galleryImgs.forEach(function(el) {
    addImg(el.getAttribute('data-zoom') || el.src);
  });

  var zoomImgs = document.querySelectorAll('[data-zoom]');
  zoomImgs.forEach(function(el) { addImg(el.getAttribute('data-zoom')); });

  var mainImgs = document.querySelectorAll('.ui-pdp-image__image');
  mainImgs.forEach(function(el) {
    addImg(el.getAttribute('data-zoom') || el.getAttribute('data-src') || el.src);
  });

  if (allImages.length > 0) img = allImages[0];

  link = link + (link.includes('?') ? '&' : '?') + 'matt_word=' + ML_ID + '&matt_tool=' + ML_TOOL;

  if (img && img.includes('mlstatic.com')) {
    img = img.replace(/_D_Q_NP_/, '_D_NP_');
    img = img.replace(/-\d+x\d+\./, '-F.webp.');
    img = img.replace(/\.webp$/, '-F.webp');
    allImages = allImages.map(function(u) {
      if (u.includes('mlstatic.com')) {
        u = u.replace(/_D_Q_NP_/, '_D_NP_');
        u = u.replace(/-\d+x\d+\./, '-F.webp.');
        u = u.replace(/\.webp$/, '-F.webp');
      }
      return u;
    });
  }

  return { store: 'ML', title: title, price: price, desc: desc, img: img, allImages: allImages, link: link };
}

function extractShopee() {
  var title = '';
  var price = '';
  var desc = '';
  var img = '';
  var allImages = [];
  var link = window.location.href.split('#')[0];

  var titleEl = document.querySelector('[data-testid="lbl-pdp-name"]') ||
                document.querySelector('.attMZH') ||
                document.querySelector('[class*="product-name"]') ||
                document.querySelector('div[class*="title"]');
  if (titleEl) title = titleEl.textContent.trim();

  var priceEl = document.querySelector('[data-testid="lbl-pdp-price-with-discount"]') ||
                document.querySelector('[data-testid="lbl-pdp-price-original"]') ||
                document.querySelector('.pqTWkA') ||
                document.querySelector('[class*="product-price"]') ||
                document.querySelector('span[class*="price"]');
  if (priceEl) price = priceEl.textContent.trim().replace(/[^0-9,.]/g, '');
  if (price) {
    var priceMatch = price.match(/[\d.,]+?,\d{2}/);
    if (priceMatch) price = priceMatch[0];
  }

  var descEl = document.querySelector('.product-detail__description') ||
               document.querySelector('[class*="product-desc"]');
  if (descEl) desc = descEl.textContent.trim().substring(0, 150);

  var seen = {};
  function addImg(src) {
    if (!src) return;
    if (!seen[src]) { seen[src] = true; allImages.push(src); }
  }

  var mainImgEl = document.querySelector('[data-testid="img-slot"] img') ||
                  document.querySelector('.product-image img') ||
                  document.querySelector('img[class*="product"]') ||
                  document.querySelector('.shopee-search-item-result__image img');
  if (mainImgEl) addImg(mainImgEl.src);

  var thumbEls = document.querySelectorAll('[data-testid*="thumbnail"] img, [class*="thumbnail"] img, [class*="slider"] img');
  thumbEls.forEach(function(el) { addImg(el.src); });

  if (!title) {
    var h1 = document.querySelector('h1, [data-sqe="name"]');
    if (h1) title = h1.textContent.trim();
  }

  var ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg) addImg(ogImg.getAttribute('content'));

  var anyImg = document.querySelector('img[src*="cf.shopee"], img[src*="down-id.img.susercontent"]');
  if (anyImg) addImg(anyImg.src);

  if (allImages.length > 0) img = allImages[0];

  link = link + (link.includes('?') ? '&' : '?') + 'utm_source=' + SP_SOURCE + '&utm_medium=affiliates';

  return { store: 'Shopee', title: title, price: price, desc: desc, img: img, allImages: allImages, link: link };
}

function extractMagalu() {
  var title = '';
  var price = '';
  var desc = '';
  var img = '';
  var allImages = [];
  var link = window.location.href.split('#')[0];

  var titleEl = document.querySelector('[data-testid="product-title"]') ||
                document.querySelector('h1[data-testid="heading-hero-title"]') ||
                document.querySelector('h1');
  if (titleEl) title = titleEl.textContent.trim();

  var priceEl = document.querySelector('[data-testid="price-value"]') ||
                document.querySelector('.price__Sales') ||
                document.querySelector('[class*="price-value"]');
  if (priceEl) {
    var raw = priceEl.textContent.trim().replace(/[^0-9,.]/g, '');
    var match = raw.match(/[\d.,]+?,\d{2}/);
    price = match ? match[0] : raw;
  }

  var descEl = document.querySelector('[data-testid="content-container"]') ||
               document.querySelector('.description__container');
  if (descEl) desc = descEl.textContent.trim().substring(0, 150);

  var seen = {};
  function addImg(src) {
    if (!src) return;
    if (!seen[src]) { seen[src] = true; allImages.push(src); }
  }

  var mainImgEl = document.querySelector('img[data-testid="image-desktop"]') ||
                  document.querySelector('img[class*="image-desktop"]') ||
                  document.querySelector('figure img') ||
                  document.querySelector('[data-testid="image-gallery"] img');
  if (mainImgEl) addImg(mainImgEl.src);

  var thumbEls = document.querySelectorAll('[data-testid*="thumbnail"] img, [class*="carousel"] img, [class*="gallery"] img');
  thumbEls.forEach(function(el) { addImg(el.src); });

  if (!title) {
    var h1 = document.querySelector('h1');
    if (h1) title = h1.textContent.trim();
  }

  var ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg) addImg(ogImg.getAttribute('content'));

  if (allImages.length > 0) img = allImages[0];

  var host = window.location.hostname;
  if (host.includes('magazineluiza.com.br')) {
    var path = window.location.pathname.replace(/\/+$/, '');
    link = 'https://www.magazinevoce.com.br/' + MG_ID + path;
  }

  if (img && img.includes('mlcdn.com.br')) {
    img = img.replace(/\/\d+x\d+\//, '/1000x1000/');
    allImages = allImages.map(function(u) {
      if (u.includes('mlcdn.com.br')) u = u.replace(/\/\d+x\d+\//, '/1000x1000/');
      return u;
    });
  }

  return { store: 'Magalu', title: title, price: price, desc: desc, img: img, allImages: allImages, link: link };
}

function extractC24() {
  var title = '';
  var price = '';
  var desc = '';
  var img = '';
  var allImages = [];
  var link = window.location.href.split('#')[0];

  var titleEl = document.querySelector('h1.titulo_azul_02') ||
                document.querySelector('h1.titulo_laranja') ||
                document.querySelector('h1[itemprop="name"]') ||
                document.querySelector('h1');
  if (titleEl) title = titleEl.textContent.trim();

  var priceEl = document.querySelector('.valor_real_1');
  if (priceEl) {
    var raw = priceEl.textContent.trim().replace(/[^0-9]/g, '');
    var centsEl = document.querySelector('.valor_centavos_1 sup');
    var cents = centsEl ? centsEl.textContent.trim().replace(',', '') : '00';
    price = raw + ',' + cents;
  }
  if (!price) {
    var precoEl = document.querySelector('.preco');
    if (precoEl) {
      var m = precoEl.textContent.match(/R\$\s*([\d.,]+)/);
      if (m) price = m[1];
    }
  }

  var descEl = document.querySelector('[itemprop="description"]') ||
               document.querySelector('.D-cursos-descricao') ||
               document.querySelector('.texto_cinza');
  if (descEl) desc = descEl.textContent.trim().substring(0, 150);

  var seen = {};
  function addImg(src) {
    if (!src) return;
    if (!src.startsWith('http')) src = 'https://www.cursos24horas.com.br' + src;
    if (!seen[src]) { seen[src] = true; allImages.push(src); }
  }

  var sliderImgs = document.querySelectorAll('.rslides img, .D-banner img');
  sliderImgs.forEach(function(el) { addImg(el.getAttribute('src')); });

  var imgCurso = document.querySelector('#img_curso img');
  if (imgCurso) addImg(imgCurso.getAttribute('src'));

  var facaImg = document.querySelector('.D-faca-curso-img');
  if (facaImg) addImg(facaImg.getAttribute('src'));

  var itempropImg = document.querySelector('[itemprop="image"]');
  if (itempropImg) addImg(itempropImg.getAttribute('src'));

  var ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg) addImg(ogImg.getAttribute('content'));

  if (allImages.length > 0) img = allImages[allImages.length - 1];

  if (!title) {
    var h1 = document.querySelector('h1');
    if (h1) title = h1.textContent.trim();
  }

  var path = window.location.pathname.replace(/\/+$/, '');
  if (path.startsWith('/')) path = path.substring(1);
  link = 'https://www.cursos24horas.com.br/parceiro.asp?cod=' + C24_AFFILIATE + '&url=' + encodeURIComponent(path);

  return { store: 'Cursos24H', title: title, price: price, desc: desc, img: img, allImages: allImages, link: link };
}

function extractProduct() {
  var store = detectStore();
  if (!store) return { store: null, error: 'Loja não suportada' };

  if (store === 'ml') return extractML();
  if (store === 'shopee') return extractShopee();
  if (store === 'magalu') return extractMagalu();
  if (store === 'c24') return extractC24();
  return { store: null, error: 'Loja não reconhecida' };
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'extract') {
    var data = extractProduct();
    data.imgDataUrl = '';
    sendResponse(data);
  }
});