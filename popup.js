var currentProduct = null;
var generatedText = '';
var allImages = [];
var imgIndex = 0;
var couponCode = '';
var couponDiscount = '';

function showStatus(msg, isError) {
  var el = document.getElementById('status');
  el.textContent = msg;
  el.className = isError ? 'status error' : 'status';
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function updateImgNav() {
  var nav = document.getElementById('imgNav');
  var thumb = document.getElementById('imgThumb');
  var prev = document.getElementById('imgPrev');
  var next = document.getElementById('imgNext');
  var counter = document.getElementById('imgCounter');

  if (allImages.length > 1) {
    nav.style.display = 'block';
    thumb.src = allImages[imgIndex];
    thumb.onerror = function() { this.style.display = 'none'; };
    thumb.style.display = 'block';
    prev.style.display = imgIndex > 0 ? 'block' : 'none';
    next.style.display = imgIndex < allImages.length - 1 ? 'block' : 'none';
    counter.style.display = 'block';
    counter.textContent = (imgIndex + 1) + ' / ' + allImages.length;
    currentProduct.img = allImages[imgIndex];
    currentProduct.imgDataUrl = '';
    downloadCurrentImg();
  } else if (allImages.length === 1) {
    nav.style.display = 'block';
    thumb.src = allImages[0];
    thumb.style.display = 'block';
    prev.style.display = 'none';
    next.style.display = 'none';
    counter.style.display = 'none';
  } else {
    nav.style.display = 'none';
  }
}

function downloadCurrentImg() {
  if (!currentProduct || !currentProduct.img) return;
  showStatus('Baixando imagem...');
  chrome.runtime.sendMessage({ action: 'fetchImage', url: currentProduct.img }, function(res) {
    if (res && res.dataUrl) {
      currentProduct.imgDataUrl = res.dataUrl;
      console.log('[Stories] imagem baixada via background');
    } else {
      console.log('[Stories] background falhou, sem imagem no story');
    }
  });
}

function extractProduct() {
  showStatus('Extraindo produto...');
  document.getElementById('storyBtn').disabled = true;

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tab = tabs[0];
    var url = tab.url || '';

    var isStore = url.includes('mercadolivre.com.br') ||
                  url.includes('mercadolibre.com') ||
                  url.includes('shopee.com.br') ||
                  url.includes('magazineluiza.com.br') ||
                  url.includes('magazinevoce.com.br') ||
                  url.includes('cursos24horas.com.br');

    if (!isStore) {
      showStatus('Abra uma pagina de produto no ML, Shopee, Magalu ou Cursos 24H', true);
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }, function() {
      if (chrome.runtime.lastError) {
        showStatus('Erro ao injetar script', true);
        return;
      }
      chrome.tabs.sendMessage(tab.id, { action: 'extract' }, function(response) {
        if (chrome.runtime.lastError || !response) {
          showStatus('Sem resposta. Recarregue a pagina.', true);
          return;
        }
        if (response.error) {
          showStatus(response.error, true);
          return;
        }
        currentProduct = response;
        allImages = response.allImages || (response.img ? [response.img] : []);
        imgIndex = 0;
        showProduct(response);
        if (allImages.length > 0) {
          updateImgNav();
          downloadCurrentImg();
        }
      });
    });
  });
}

function showProduct(data) {
  var storeColors = { 'ML': '#FFE600', 'Shopee': '#EE4D2D', 'Magalu': '#0086FF', 'Cursos24H': '#E67E22' };
  var storeColor = storeColors[data.store] || '#888';

  var card = document.getElementById('productCard');
  var nav = document.getElementById('imgNav');
  var couponWrap = document.getElementById('couponWrap');
  card.innerHTML = '';
  card.appendChild(nav);

  var html = '<div class="product-info">';
  html += '<span class="store-badge" style="background:' + storeColor + '">' + escHtml(data.store) + '</span>';
  if (data.title) {
    html += '<div class="product-title">' + escHtml(data.title) + '</div>';
  }
  if (data.price) {
    html += '<div class="product-price">R$ ' + escHtml(data.price) + '</div>';
  }
  html += '</div>';

  card.insertAdjacentHTML('beforeend', html);
  card.appendChild(couponWrap);
  card.style.display = 'block';

  couponWrap.style.display = 'block';
  document.getElementById('couponInput').value = couponCode;
  document.getElementById('couponDiscount').value = couponDiscount;

  document.getElementById('storyBtn').style.display = 'block';
  document.getElementById('storyBtn').disabled = false;
  showStatus('Produto extraido. Clique para gerar story.');
}

function doGenerate() {
  console.log('[Stories] doGenerate INICIADO');
  if (!currentProduct) {
    showStatus('Nenhum produto extraido', true);
    return;
  }

  var storyBtn = document.getElementById('storyBtn');
  var preview = document.getElementById('preview');
  var canvas = document.getElementById('canvas');

  storyBtn.disabled = true;
  showStatus('Gerando story...');

  try {
    var storyWidth = 1080;
    var storyHeight = 1920;
    var padding = 60;

    canvas.width = storyWidth;
    canvas.height = storyHeight;
    var ctx = canvas.getContext('2d');

    var gradient = ctx.createLinearGradient(0, 0, 0, storyHeight);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, storyWidth, storyHeight);

    var imgSrc = currentProduct.imgDataUrl ? currentProduct.imgDataUrl : '';

    if (imgSrc) {
      var img = new Image();
      img.onload = function() {
        try {
          drawImageOnCanvas(ctx, img, storyWidth, storyHeight, padding);
          drawText(ctx, currentProduct, storyWidth, storyHeight, padding);
          drawCoupon(ctx, currentProduct, storyWidth, storyHeight, padding);
          drawQR(ctx, currentProduct, storyWidth, storyHeight, padding);
          finishStory(preview, storyBtn);
        } catch (e) {
          console.error('[Stories] erro ao desenhar:', e);
          showStatus('Erro ao desenhar: ' + e.message, true);
          storyBtn.disabled = false;
        }
      };
      img.onerror = function() {
        console.log('[Stories] imagem falhou, gerando sem imagem');
        try {
          drawText(ctx, currentProduct, storyWidth, storyHeight, padding);
          drawCoupon(ctx, currentProduct, storyWidth, storyHeight, padding);
          drawQR(ctx, currentProduct, storyWidth, storyHeight, padding);
          finishStory(preview, storyBtn);
        } catch (e) {
          showStatus('Erro: ' + e.message, true);
          storyBtn.disabled = false;
        }
      };
      img.src = imgSrc;
    } else {
      drawText(ctx, currentProduct, storyWidth, storyHeight, padding);
      drawCoupon(ctx, currentProduct, storyWidth, storyHeight, padding);
      drawQR(ctx, currentProduct, storyWidth, storyHeight, padding);
      finishStory(preview, storyBtn);
    }
  } catch (err) {
    console.error('[Stories] erro:', err);
    showStatus('Erro: ' + err.message, true);
    storyBtn.disabled = false;
  }
}

function drawImageOnCanvas(ctx, img, w, h, pad) {
  var maxW = w - pad * 2;
  var maxH = h * 0.55;
  var imgW = img.naturalWidth || img.width;
  var imgH = img.naturalHeight || img.height;
  var scale = Math.min(maxW / imgW, maxH / imgH);
  if (scale < 1) scale = 1;
  imgW *= scale;
  imgH *= scale;
  var imgX = (w - imgW) / 2;
  var imgY = pad + (maxH - imgH) / 2;

  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  roundRect(ctx, imgX - 10, imgY - 10, imgW + 20, imgH + 20, 20);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.drawImage(img, imgX, imgY, imgW, imgH);
}

function drawText(ctx, product, w, h, pad) {
  var textY = pad + (h * 0.55) + 80;

  if (product.price) {
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 44px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('R$ ' + product.price + '*', w / 2, textY);
    textY += 70;
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px Arial, sans-serif';
  ctx.textAlign = 'center';
  wrapText(ctx, product.title || 'Produto', w / 2, textY, w - pad * 2, 64);
}

function drawQR(ctx, product, w, h, pad) {
  var qr = QRCode.create(0, 'M');
  qr.addData(product.link);
  qr.make();
  var mc = qr.getModuleCount();
  var cs = Math.floor(260 / mc);
  var size = mc * cs + 20;

  var qrCanvas = document.createElement('canvas');
  qrCanvas.width = size;
  qrCanvas.height = size;
  var qrCtx = qrCanvas.getContext('2d');
  qrCtx.fillStyle = '#ffffff';
  qrCtx.fillRect(0, 0, size, size);
  qrCtx.fillStyle = '#1a1a2e';
  for (var r = 0; r < mc; r++) {
    for (var c = 0; c < mc; c++) {
      if (qr.isDark(r, c)) {
        qrCtx.fillRect(c * cs + 10, r * cs + 10, cs, cs);
      }
    }
  }

  var qrX = (w - size) / 2;
  var qrY = h - size - pad - 120;

  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 20;
  roundRect(ctx, qrX - 15, qrY - 15, size + 30, size + 30, 16);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.drawImage(qrCanvas, qrX, qrY, size, size);

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '28px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('*Pode haver pequenas variações no valor exibido.', w / 2, h - pad + 10);
}

function finishStory(preview, storyBtn) {
  var canvas = document.getElementById('canvas');
  generatedText = (currentProduct.title || 'Produto');
  if (currentProduct.price) generatedText += '\nR$ ' + currentProduct.price;
  if (couponCode) generatedText += '\n\nCUPOM: ' + couponCode.toUpperCase();
  if (couponDiscount.trim()) generatedText += '\nDESCONTO: ' + couponDiscount.trim().toUpperCase();
  generatedText += '\n\nConfira este produto!\n' + currentProduct.link;

  preview.src = canvas.toDataURL('image/png');
  preview.style.display = 'block';
  document.getElementById('downloadBtn').style.display = 'block';
  document.getElementById('copyBtn').style.display = 'block';
  storyBtn.disabled = false;
  showStatus('Story gerado!');
}

function drawCoupon(ctx, product, w, h, pad) {
  if (!couponCode) return;

  var label = 'CUPOM';
  var code = couponCode.toUpperCase();
  var discount = couponDiscount.trim().toUpperCase();

  ctx.font = 'bold 32px Arial, sans-serif';
  var labelW = ctx.measureText(label).width;
  ctx.font = 'bold 42px Arial, sans-serif';
  var codeW = ctx.measureText(code).width;
  var bw = Math.max(labelW, codeW) + 60;
  var bh = discount ? 160 : 110;
  var bx = pad;
  var by = pad;

  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 6;
  roundRect(ctx, bx, by, bw, bh, 16);
  ctx.fillStyle = '#e94560';
  ctx.fill();
  ctx.shadowColor = 'transparent';

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 32px Arial, sans-serif';
  ctx.fillText(label, bx + bw / 2, by + 38);

  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.fillText(code, bx + bw / 2, by + 88);

  if (discount) {
    ctx.font = 'bold 42px Arial, sans-serif';
    ctx.fillText(discount, bx + bw / 2, by + 138);
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  var words = text.split(' ');
  var line = '';
  var currentY = y;
  for (var i = 0; i < words.length; i++) {
    var testLine = line + words[i] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

document.getElementById('storyBtn').addEventListener('click', doGenerate);
document.getElementById('couponInput').addEventListener('input', function() {
  couponCode = this.value.trim();
});
document.getElementById('couponDiscount').addEventListener('input', function() {
  couponDiscount = this.value.trim();
});
document.getElementById('downloadBtn').addEventListener('click', function() {
  var link = document.createElement('a');
  link.download = 'story-' + Date.now() + '.png';
  link.href = document.getElementById('canvas').toDataURL('image/png');
  link.click();
});
document.getElementById('copyBtn').addEventListener('click', function() {
  navigator.clipboard.writeText(generatedText).then(function() {
    showStatus('Texto copiado!');
  });
});
document.getElementById('imgPrev').addEventListener('click', function() {
  if (imgIndex > 0) { imgIndex--; updateImgNav(); }
});
document.getElementById('imgNext').addEventListener('click', function() {
  if (imgIndex < allImages.length - 1) { imgIndex++; updateImgNav(); }
});

extractProduct();
