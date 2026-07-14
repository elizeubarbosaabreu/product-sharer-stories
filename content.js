var ML_ID = 'elizeubarbosaabreu';
var ML_TOOL = '14951425';
var SP_SOURCE = 'an_18348900080';
var MG_ID = 'magazinematapreco';

function detectStore() {
  var host = window.location.hostname;
  if (host.includes('mercadolivre.com.br') || host.includes('mercadolibre.com')) return 'ml';
  if (host.includes('shopee.com.br')) return 'shopee';
  if (host.includes('magazineluiza.com.br') || host.includes('magazinevoce.com.br')) return 'magalu';
  return null;
}

function extractML() {
  var title = '';
  var price = '';
  var desc = '';
  var img = '';
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

  var ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg) img = ogImg.getAttribute('content');

  if (!img) {
    var galleryImg = document.querySelector('.ui-pdp-gallery__figure__img');
    if (galleryImg) img = galleryImg.getAttribute('data-zoom') || galleryImg.src;
  }

  if (!img) {
    var zoomImg = document.querySelector('[data-zoom]');
    if (zoomImg) img = zoomImg.getAttribute('data-zoom');
  }

  if (!img) {
    var mainImg = document.querySelector('.ui-pdp-image__image');
    if (mainImg) img = mainImg.getAttribute('data-zoom') || mainImg.getAttribute('data-src') || mainImg.src;
  }

  link = link + (link.includes('?') ? '&' : '?') + 'matt_word=' + ML_ID + '&matt_tool=' + ML_TOOL;

  if (img && img.includes('mlstatic.com')) {
    img = img.replace(/_D_Q_NP_/, '_D_NP_');
    img = img.replace(/-\d+x\d+\./, '-F.webp.');
    img = img.replace(/\.webp$/, '-F.webp');
  }

  return { store: 'ML', title: title, price: price, desc: desc, img: img, link: link };
}

function extractShopee() {
  var title = '';
  var price = '';
  var desc = '';
  var img = '';
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

  var descEl = document.querySelector('.product-detail__description') ||
               document.querySelector('[class*="product-desc"]');
  if (descEl) desc = descEl.textContent.trim().substring(0, 150);

  var imgEl = document.querySelector('[data-testid="img-slot"] img') ||
              document.querySelector('.product-image img') ||
              document.querySelector('img[class*="product"]') ||
              document.querySelector('.shopee-search-item-result__image img');
  if (imgEl) img = imgEl.src;

  if (!title) {
    var h1 = document.querySelector('h1, [data-sqe="name"]');
    if (h1) title = h1.textContent.trim();
  }

  if (!img) {
    var ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) img = ogImg.getAttribute('content');
  }

  if (!img) {
    var anyImg = document.querySelector('img[src*="cf.shopee"], img[src*="down-id.img.susercontent"]');
    if (anyImg) img = anyImg.src;
  }

  var keywords = encodeURIComponent(title || 'produto');
  link = 'https://shopee.com.br/search?keyword=' + keywords +
    '&utm_source=' + SP_SOURCE + '&utm_medium=affiliates';

  return { store: 'Shopee', title: title, price: price, desc: desc, img: img, link: link };
}

function extractMagalu() {
  var title = '';
  var price = '';
  var desc = '';
  var img = '';
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
    var match = raw.match(/[\d]+[.,]\d{2}/);
    price = match ? match[0] : raw;
  }

  var descEl = document.querySelector('[data-testid="content-container"]') ||
               document.querySelector('.description__container');
  if (descEl) desc = descEl.textContent.trim().substring(0, 150);

  var imgEl = document.querySelector('img[data-testid="image-desktop"]') ||
              document.querySelector('img[class*="image-desktop"]') ||
              document.querySelector('figure img') ||
              document.querySelector('[data-testid="image-gallery"] img');
  if (imgEl) img = imgEl.src;

  if (!title) {
    var h1 = document.querySelector('h1');
    if (h1) title = h1.textContent.trim();
  }

  if (!img) {
    var ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) img = ogImg.getAttribute('content');
  }

  if (!img) {
    var anyImg = document.querySelector('.carousel__image img, [class*="gallery"] img');
    if (anyImg) img = anyImg.src;
  }

  link = 'https://www.magazinevoce.com.br/' + MG_ID + '/busca/' + encodeURIComponent(title || 'produto') + '/';

  if (img && img.includes('mlcdn.com.br')) {
    img = img.replace(/\/\d+x\d+\//, '/1000x1000/');
  }

  return { store: 'Magalu', title: title, price: price, desc: desc, img: img, link: link };
}

function extractProduct() {
  var store = detectStore();
  if (!store) return { store: null, error: 'Loja não suportada' };

  if (store === 'ml') return extractML();
  if (store === 'shopee') return extractShopee();
  if (store === 'magalu') return extractMagalu();
  return { store: null, error: 'Loja não reconhecida' };
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'extract') {
    var data = extractProduct();
    data.imgDataUrl = '';
    sendResponse(data);
  }
});