'use strict';

/* ════════════════════════════════════════════════════════
   TECHCELL PY — FASE 2
   Formulario de pre-consulta obligatorio + Resumen
   + Protección anti-scraping completa (FASE 1 heredada)
   ════════════════════════════════════════════════════════ */

/* ── Número ofuscado: partes separadas, ensambladas en runtime ── */
var _p = ['5','9','5','9','9','2','1','0','2','2','0','2'];
function _n() { return _p.join(''); }

/* ── Detección de bots ── */
var _BOT_UA = [
  /bot/i,/crawler/i,/spider/i,/scraper/i,/facebookexternalhit/i,/facebot/i,
  /Twitterbot/i,/linkedinbot/i,/WhatsApp/i,/Googlebot/i,/AdsBot/i,
  /Mediapartners/i,/bingbot/i,/slurp/i,/duckduckbot/i,/baiduspider/i,
  /yandexbot/i,/sogou/i,/ia_archiver/i,/curl/i,/wget/i,/python-requests/i,
  /axios/i,/node-fetch/i,/scrapy/i,/httrack/i,/java\//i,/libwww/i,/go-http-client/i
];
function _isBot() {
  var ua = navigator.userAgent || '';
  return _BOT_UA.some(function(p) { return p.test(ua); });
}
function _isAutomated() {
  return (
    navigator.webdriver === true ||
    window.callPhantom != null || window._phantom != null ||
    window.__nightmare != null || window.domAutomation != null ||
    /HeadlessChrome/.test(navigator.userAgent) ||
    !navigator.languages || navigator.languages.length === 0
  );
}
function _ok() { return !_isBot() && !_isAutomated(); }

/* ── UTM ── */
var _UTM = (function() {
  var p = new URLSearchParams(window.location.search);
  return {
    source:   p.get('utm_source')   || 'directo',
    medium:   p.get('utm_medium')   || 'ninguno',
    campaign: p.get('utm_campaign') || 'ninguna',
    content:  p.get('utm_content')  || '',
    term:     p.get('utm_term')     || ''
  };
})();
function _utmSufijo() {
  return _UTM.source === 'directo' ? '' :
    ' [' + _UTM.source + '/' + _UTM.medium + '/' + _UTM.campaign + ']';
}

/* ── Constructor seguro WA ── */
function _waUrl(msg) {
  if (!_ok()) return '#bloqueado';
  return 'https://wa.me/' + _n() + '?text=' + encodeURIComponent(msg + _utmSufijo());
}

/* ════════════════════════════════════════════════════════
   ESTADO GLOBAL DE PRE-CONSULTA
   Guarda: pendingMsg, pendingProducto, datos del docente
   ════════════════════════════════════════════════════════ */
var _PC = {
  pendingMsg:      '',   /* Mensaje base (producto + cuotas) */
  pendingProducto: '',   /* Label del producto para mostrar */
  nombre:          '',
  institucion:     '',
  ciudad:          '',
  datosCompletos:  false
};

/* ════════════════════════════════════════════════════════
   FORMATEO
   ════════════════════════════════════════════════════════ */
function formatGs(n) {
  return Math.round(n).toLocaleString('es-PY') + ' Gs';
}

/* ════════════════════════════════════════════════════════
   PROTECCIÓN ANTI-COPY / ANTI-INSPECT
   ════════════════════════════════════════════════════════ */
function initAntiCopy() {
  var css = document.createElement('style');
  css.textContent =
    '.wa-secure,.card__wa-link,.wa-float,.footer__copy{' +
    'user-select:none;-webkit-user-select:none;-moz-user-select:none;}';
  document.head.appendChild(css);
  document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'F12') { e.preventDefault(); return false; }
    if (e.ctrlKey && e.shiftKey && 'IJC'.indexOf(e.key) !== -1) { e.preventDefault(); return false; }
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) { e.preventDefault(); return false; }
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); return false; }
  });
}

/* ════════════════════════════════════════════════════════
   FASE 2 — MODAL PRE-CONSULTA
   ════════════════════════════════════════════════════════ */
function initPreConsulta() {
  var overlay       = document.getElementById('preconsultaOverlay');
  var pasoForm      = document.getElementById('pasoFormulario');
  var pasoResumen   = document.getElementById('pasoResumen');
  var btnCerrar     = document.getElementById('preconsultaClose');
  var btnContinuar  = document.getElementById('pfBtnContinuar');
  var btnBack       = document.getElementById('resumenBtnBack');
  var btnWa         = document.getElementById('resumenBtnWa');
  var elProducto    = document.getElementById('preconsultaProducto');
  var elResumen     = document.getElementById('resumenPreview');

  var inpNombre     = document.getElementById('pfNombre');
  var inpInstit     = document.getElementById('pfInstitucion');
  var inpCiudad     = document.getElementById('pfCiudad');

  if (!overlay) return;

  /* ── Abrir modal ── */
  function abrir(msgBase, productoLabel) {
    if (!_ok()) return; /* Bot: no mostrar nada */
    _PC.pendingMsg      = msgBase;
    _PC.pendingProducto = productoLabel || '';

    /* Mostrar chip del producto */
    if (elProducto) {
      elProducto.textContent = productoLabel
        ? '📱 Consultando: ' + productoLabel
        : '💬 Consulta general';
    }

    /* Si ya tiene datos: ir directo al resumen */
    if (_PC.datosCompletos) {
      mostrarResumen();
    } else {
      mostrarPaso(pasoForm);
    }

    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    /* Foco al primer campo */
    setTimeout(function() {
      if (inpNombre && !_PC.datosCompletos) inpNombre.focus();
    }, 320);
  }

  /* ── Cerrar modal ── */
  function cerrar() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ── Mostrar paso ── */
  function mostrarPaso(paso) {
    [pasoForm, pasoResumen].forEach(function(p) { if(p) p.classList.add('hidden'); });
    if (paso) paso.classList.remove('hidden');
  }

  /* ── Cerrar con botones ── */
  if (btnCerrar) btnCerrar.addEventListener('click', cerrar);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) cerrar(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') cerrar(); });

  /* Botón cerrar del paso resumen */
  document.querySelectorAll('.preconsulta-close--resumen').forEach(function(btn) {
    btn.addEventListener('click', cerrar);
  });

  /* ── Validación del formulario ── */
  function validar() {
    var ok = true;
    function chk(inp, errId) {
      var campo = inp.closest('.pf-field');
      var err   = document.getElementById(errId);
      if (!inp.value.trim()) {
        if (campo) campo.classList.add('has-error');
        ok = false;
      } else {
        if (campo) campo.classList.remove('has-error');
      }
    }
    chk(inpNombre,  'errNombre');
    chk(inpInstit,  'errInstitucion');
    chk(inpCiudad,  'errCiudad');
    return ok;
  }

  /* Limpiar error al escribir */
  [inpNombre, inpInstit, inpCiudad].forEach(function(inp) {
    if (!inp) return;
    inp.addEventListener('input', function() {
      var campo = inp.closest('.pf-field');
      if (campo && inp.value.trim()) campo.classList.remove('has-error');
    });
    /* Enter avanza entre campos */
    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var campos = [inpNombre, inpInstit, inpCiudad];
        var idx = campos.indexOf(inp);
        if (idx < campos.length - 1) {
          campos[idx + 1].focus();
        } else {
          if (btnContinuar) btnContinuar.click();
        }
      }
    });
  });

  /* ── Botón Continuar → mostrar resumen ── */
  if (btnContinuar) {
    btnContinuar.addEventListener('click', function() {
      if (!validar()) return;
      _PC.nombre     = inpNombre.value.trim();
      _PC.institucion = inpInstit.value.trim();
      _PC.ciudad     = inpCiudad.value.trim();
      _PC.datosCompletos = true;
      mostrarResumen();
    });
  }

  /* ── Construir resumen ── */
  function mostrarResumen() {
    mostrarPaso(pasoResumen);

    /* Mensaje completo que se enviará */
    var msgCompleto = construirMensaje(_PC.pendingMsg);

    if (elResumen) {
      var lineas = [
        { ico: '👤', key: 'Nombre',       val: _PC.nombre },
        { ico: '🏫', key: 'Institución',  val: _PC.institucion },
        { ico: '📍', key: 'Ciudad',       val: _PC.ciudad }
      ];

      var html = lineas.map(function(l) {
        return '<div class="resumen-linea">' +
          '<span class="resumen-ico">' + l.ico + '</span>' +
          '<span class="resumen-key">' + l.key + '</span>' +
          '<span class="resumen-val">' + l.val + '</span>' +
          '</div>';
      }).join('');

      html += '<span class="resumen-msg-label">📨 Mensaje que se enviará</span>';
      html += '<div class="resumen-msg-text">' +
        msgCompleto.replace(/\n/g, '<br/>') +
        '</div>';

      elResumen.innerHTML = html;
    }
  }

  /* ── Construir mensaje final con datos del docente ── */
  function construirMensaje(msgBase) {
    var lineas = [
      msgBase,
      '',
      '📋 Datos del docente:',
      '👤 ' + _PC.nombre,
      '🏫 ' + _PC.institucion,
      '📍 ' + _PC.ciudad
    ];
    if (_UTM.source !== 'directo') {
      lineas.push('🔗 Canal: ' + _UTM.source + '/' + _UTM.medium);
    }
    return lineas.join('\n');
  }

  /* ── Volver al formulario ── */
  if (btnBack) {
    btnBack.addEventListener('click', function() {
      mostrarPaso(pasoForm);
      setTimeout(function() { if (inpNombre) inpNombre.focus(); }, 100);
    });
  }

  /* ── Enviar por WhatsApp ── */
  if (btnWa) {
    btnWa.addEventListener('click', function() {
      if (!_ok()) return;
      var msgFinal = construirMensaje(_PC.pendingMsg);
      var url = 'https://wa.me/' + _n() + '?text=' + encodeURIComponent(msgFinal + _utmSufijo());
      window.open(url, '_blank', 'noopener,noreferrer');
      cerrar();
    });
  }

  /* ── Exponer función abrir globalmente ── */
  window._abrirPreConsulta = abrir;
}

/* ════════════════════════════════════════════════════════
   INTERCEPTAR TODOS LOS CLICKS DE WA
   (reemplaza el comportamiento por defecto del href)
   ════════════════════════════════════════════════════════ */
function initWaInterceptor() {
  if (!_ok()) {
    /* Bot: ocultar todos los contactos */
    document.querySelectorAll('.wa-secure,.card__wa-link,.wa-float').forEach(function(el) {
      el.removeAttribute('href');
      el.style.pointerEvents = 'none';
      el.style.opacity = '0';
    });
    return;
  }

  /* Interceptar data-wa links (hero, cta, float) */
  document.querySelectorAll('[data-wa]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      var msg = el.dataset.msg || 'Hola! Quiero consultar sobre celulares en cuotas.';
      var label = el.dataset.producto || '';
      if (window._abrirPreConsulta) window._abrirPreConsulta(msg, label);
    });
  });

  /* Interceptar botones WA de las tarjetas */
  document.querySelectorAll('.card__wa-link').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      /* El mensaje ya fue construido por initCuotero y guardado en data-msg-actual */
      var msg  = el.dataset.msgActual || 'Hola! Quiero consultar sobre un celular.';
      var prod = el.dataset.producto  || '';
      if (window._abrirPreConsulta) window._abrirPreConsulta(msg, prod);
    });
  });
}

/* ════════════════════════════════════════════════════════
   CUOTERO — guarda mensaje en data-msg-actual
   ════════════════════════════════════════════════════════ */
function initCuotero() {
  document.querySelectorAll('.cuotero').forEach(function(cuotero) {
    var card    = cuotero.closest('.card');
    var precio  = parseFloat(card.dataset.precio);
    var modelo  = card.dataset.modelo || card.querySelector('.card__name').textContent.trim();
    var botones = cuotero.querySelectorAll('.cuota-btn');
    var elMonto = cuotero.querySelector('.cuotero__monto');
    var elLabel = cuotero.querySelector('.cuotero__num-label');
    var waLink  = card.querySelector('.card__wa-link');

    function actualizar(btn) {
      var cuotas = parseInt(btn.dataset.cuotas, 10);
      var fmt    = formatGs(precio / cuotas);

      if (elMonto) {
        elMonto.textContent = fmt;
        elMonto.classList.remove('flash');
        void elMonto.offsetWidth;
        elMonto.classList.add('flash');
      }
      if (elLabel) elLabel.textContent = cuotas + ' cuotas de';
      botones.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');

      /* Guardar mensaje actual y label del producto en el link */
      if (waLink) {
        waLink.dataset.msgActual = 'Hola! Soy docente y me interesa el ' + modelo +
          ' en ' + cuotas + ' cuotas de ' + fmt + '.';
        waLink.dataset.producto = modelo + ' · ' + cuotas + ' cuotas de ' + fmt;
      }
    }

    botones.forEach(function(btn) {
      btn.addEventListener('click', function() { actualizar(btn); });
    });
    var activo = cuotero.querySelector('.cuota-btn.active');
    if (activo) actualizar(activo);
  });
}

/* ════════════════════════════════════════════════════════
   SELECTOR DE MARCA
   ════════════════════════════════════════════════════════ */
function initMarcaSelector() {
  var marcaBtns  = document.querySelectorAll('.marca-btn');
  var gridSams   = document.getElementById('grid-samsung');
  var gridXiaomi = document.getElementById('grid-xiaomi');
  if (!gridSams || !gridXiaomi) return;
  marcaBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      marcaBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      if (btn.dataset.marca === 'samsung') {
        gridSams.classList.remove('hidden');
        gridXiaomi.classList.add('hidden');
      } else {
        gridXiaomi.classList.remove('hidden');
        gridSams.classList.add('hidden');
      }
    });
  });
}

/* ════════════════════════════════════════════════════════
   CARRUSEL
   ════════════════════════════════════════════════════════ */
function initCarruseles() {
  document.querySelectorAll('.card__carousel').forEach(function(carousel) {
    var track   = carousel.querySelector('.carousel__track');
    var imgs    = carousel.querySelectorAll('.carousel__img');
    var dots    = carousel.querySelectorAll('.dot');
    var btnPrev = carousel.querySelector('.carousel__btn--prev');
    var btnNext = carousel.querySelector('.carousel__btn--next');
    var total   = imgs.length, actual = 0;
    if (total <= 1) return;
    function ir(idx) {
      actual = (idx + total) % total;
      track.style.transform = 'translateX(-' + (actual * 100) + '%)';
      dots.forEach(function(d, i) { d.classList.toggle('active', i === actual); });
    }
    if (btnPrev) btnPrev.addEventListener('click', function() { ir(actual - 1); });
    if (btnNext) btnNext.addEventListener('click', function() { ir(actual + 1); });
    dots.forEach(function(d, i) { d.addEventListener('click', function() { ir(i); }); });
    var timer = setInterval(function() { ir(actual + 1); }, 4000);
    carousel.addEventListener('mouseenter', function() { clearInterval(timer); });
    carousel.addEventListener('mouseleave', function() {
      timer = setInterval(function() { ir(actual + 1); }, 4000);
    });
  });
}

/* ════════════════════════════════════════════════════════
   AUTOCHATBOT
   ════════════════════════════════════════════════════════ */
var CB = {
  cobro:              { p: '💳 Cobro de cuotas',        r: 'El precio se divide en cuotas iguales de <strong>6, 12, 18 o 24 meses</strong>. El importe mensual es siempre el mismo. Calculalo en la ficha del producto.' },
  debito:             { p: '🏦 Débito automático',       r: 'El cobro se realiza mediante <strong>débito automático mensual</strong> sobre la cuenta registrada al comprar. Sin transferencias manuales, sin cuotas perdidas.' },
  envios:             { p: '📦 Envíos',                  r: 'Realizamos <strong>envíos seguros</strong> con entrega en <strong>domicilio u oficina</strong> en todo el territorio de la República del Paraguay.' },
  'horario-envio':    { p: '🕐 Horario de envíos',       r: 'Los despachos se realizan de <strong>lunes a viernes de 08:00 a 18:00 hs</strong>. Pedidos confirmados dentro de ese horario salen el mismo día.' },
  seguridad:          { p: '🔒 Seguridad de envíos',     r: 'Envíos <strong>100% seguros</strong> con seguimiento y confirmación de entrega. Equipos embalados y asegurados hasta tus manos.' },
  'horario-atencion': { p: '📞 Horario de atención',     r: 'Atención de <strong>lunes a viernes de 08:00 a 18:00 hs</strong> por WhatsApp. Fuera de horario tu consulta queda registrada para el día hábil siguiente.' },
  whatsapp:           { p: '💬 Hablar con un asesor',    r: 'Un asesor te atiende de <strong>lunes a viernes de 08:00 a 18:00 hs</strong>. Completá el formulario y te contactamos.' }
};

function initChatbot() {
  var overlay  = document.getElementById('chatbotOverlay');
  var body     = document.getElementById('chatbotBody');
  var menu     = document.getElementById('chatbotMenu');
  var btnAbrir = document.getElementById('btnAbrirChatbot');
  var btnCerr  = document.getElementById('chatbotClose');
  if (!overlay || !btnAbrir) return;

  function abrir()  { overlay.classList.add('open');    overlay.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
  function cerrar() { overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true');  document.body.style.overflow=''; }

  btnAbrir.addEventListener('click', abrir);
  if (btnCerr) btnCerr.addEventListener('click', cerrar);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) cerrar(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') cerrar(); });

  function addMsg(html, user) {
    var d = document.createElement('div');
    d.className = 'chatbot-msg' + (user ? ' chatbot-msg--user' : '');
    d.innerHTML = '<span class="chatbot-msg__avatar">'+(user?'🎓':'🤖')+'</span>'+
      '<div class="chatbot-msg__bubble">'+html+'</div>';
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }
  function typing(cb) {
    var t = document.createElement('div');
    t.className = 'chatbot-msg';
    t.innerHTML = '<span class="chatbot-msg__avatar">🤖</span>'+
      '<div class="chatbot-msg__bubble chatbot-typing"><span></span><span></span><span></span></div>';
    body.appendChild(t); body.scrollTop = body.scrollHeight;
    setTimeout(function() { body.removeChild(t); cb(); }, 900);
  }

  document.querySelectorAll('.chatbot-opt').forEach(function(opt) {
    opt.addEventListener('click', function() {
      var d = CB[opt.dataset.topic]; if (!d) return;
      addMsg(d.p, true);
      menu.style.opacity = '0.4'; menu.style.pointerEvents = 'none';
      typing(function() {
        var html = d.r;
        /* Botón WA en el chatbot → también pasa por pre-consulta */
        if (opt.dataset.topic === 'whatsapp' && _ok()) {
          html += '<br/><br/><button onclick="(function(){' +
            'if(window._abrirPreConsulta)' +
            'window._abrirPreConsulta(\'Hola! Soy docente y quiero consultar sobre celulares en cuotas.\',\'\');' +
            '})()" style="display:inline-flex;align-items:center;gap:6px;background:#25d366;color:#fff;' +
            'padding:8px 16px;border-radius:8px;font-weight:700;font-size:.82rem;border:none;' +
            'cursor:pointer;margin-top:4px;">💬 Consultar ahora</button>';
        }
        addMsg(html, false);
        menu.style.opacity = ''; menu.style.pointerEvents = '';
      });
    });
  });
}

/* ════════════════════════════════════════════════════════
   FAQ
   ════════════════════════════════════════════════════════ */
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var open = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-q').forEach(function(b) {
        b.setAttribute('aria-expanded','false');
        var r = b.nextElementSibling; if (r) r.classList.remove('open');
      });
      if (!open) {
        btn.setAttribute('aria-expanded','true');
        var r = btn.nextElementSibling; if (r) r.classList.add('open');
      }
    });
  });
}

/* ════════════════════════════════════════════════════════
   NAV + SCROLL + BURGER + SMOOTH
   ════════════════════════════════════════════════════════ */
function initNavScroll() {
  var links = document.querySelectorAll('.nav__link');
  var secs  = ['home','productos','faq','contacto']
    .map(function(id){ return document.getElementById(id); }).filter(Boolean);
  window.addEventListener('scroll', function() {
    var pos = window.scrollY + 100;
    secs.forEach(function(s) {
      var l = document.querySelector('.nav__link[href="#'+s.id+'"]'); if(!l) return;
      if (pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight) {
        links.forEach(function(x){ x.classList.remove('active'); });
        l.classList.add('active');
      }
    });
  }, {passive:true});
}
function initBtnTop() {
  var btn = document.getElementById('btnTop'); if (!btn) return;
  window.addEventListener('scroll', function(){
    btn.classList.toggle('visible', window.scrollY > 400);
  }, {passive:true});
}
function initBurger() {
  var b = document.getElementById('burger');
  var m = document.querySelector('.nav__menu'); if (!b||!m) return;
  b.addEventListener('click', function(){ b.classList.toggle('open'); m.classList.toggle('mobile-open'); });
  m.querySelectorAll('.nav__link').forEach(function(l){
    l.addEventListener('click', function(){ b.classList.remove('open'); m.classList.remove('mobile-open'); });
  });
}
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var d = document.querySelector(a.getAttribute('href'));
      if (d) { e.preventDefault(); d.scrollIntoView({behavior:'smooth',block:'start'}); }
    });
  });
}
function injectFlash() {
  var s = document.createElement('style');
  s.textContent = '@keyframes flash{0%{transform:scale(1.15);color:#fff}100%{transform:scale(1);color:var(--naranja-2)}}.flash{animation:flash .28s ease forwards}';
  document.head.appendChild(s);
}

/* ════════════════════════════════════════════════════════
   DEBUG UTM — solo con ?debug=1
   ════════════════════════════════════════════════════════ */
function initUTMDebug() {
  if (new URLSearchParams(window.location.search).get('debug') !== '1') return;
  var d = document.createElement('div');
  d.style.cssText = 'position:fixed;bottom:90px;left:16px;z-index:9998;background:#111118;' +
    'border:1px solid #2a2a38;border-radius:8px;padding:10px 14px;font-size:.68rem;' +
    'font-family:monospace;color:#8888a0;line-height:1.8;pointer-events:none;max-width:220px;';
  d.innerHTML =
    '<strong style="color:#ff6b1a">🔍 UTM Debug</strong><br/>' +
    'source: <b style="color:#f0f0f8">'+_UTM.source+'</b><br/>' +
    'medium: <b style="color:#f0f0f8">'+_UTM.medium+'</b><br/>' +
    'campaign: <b style="color:#f0f0f8">'+_UTM.campaign+'</b><br/>' +
    'Bot: <b style="color:'+(_isBot()?'#f55':'#25d366')+'">'+(_isBot()?'⚠ SÍ':'✓ NO')+'</b><br/>' +
    'Auto: <b style="color:'+(_isAutomated()?'#f55':'#25d366')+'">'+(_isAutomated()?'⚠ SÍ':'✓ NO')+'</b><br/>' +
    'Formulario: <b style="color:'+(_PC.datosCompletos?'#25d366':'#8888a0')+'">'+(_PC.datosCompletos?'✓ OK':'pendiente')+'</b>';
  document.body.appendChild(d);
}

/* ════════════════════════════════════════════════════════
   INICIO
   ════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  /* 1. Seguridad */
  initAntiCopy();
  injectFlash();

  /* 2. FASE 2: Pre-consulta (inicializar ANTES del interceptor) */
  initPreConsulta();
  initWaInterceptor();

  /* 3. UI */
  initMarcaSelector();
  initCuotero();
  initCarruseles();
  initChatbot();
  initFAQ();
  initNavScroll();
  initBtnTop();
  initBurger();
  initSmoothScroll();
  initUTMDebug();

  console.log('✅ TechCell PY — FASE 2 activa');
});
