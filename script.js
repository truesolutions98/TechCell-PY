/**
 * TechCell PY — script.js v2
 * ─────────────────────────────────────────────────
 * Módulos:
 *   1. Cuotero automático (6 / 12 / 18 / 24 cuotas)
 *   2. Actualización dinámica de links de WhatsApp
 *   3. Acordeón de Preguntas Frecuentes (FAQ)
 *   4. Animación de entrada al hacer scroll (cards)
 * ─────────────────────────────────────────────────
 */

'use strict';

/* ============================================================
   NÚMEROS DE WHATSAPP
   ============================================================ */
var WA_MATHEO = '595992102202';
var WA_JESUS  = '595987101181';

/* ============================================================
   UTILIDADES
   ============================================================ */

/**
 * Formatea guaraníes en formato paraguayo.
 * Ejemplo: 885000 → "885.000 Gs"
 */
function formatGs(monto) {
  var entero = Math.round(monto);
  return entero.toLocaleString('es-PY') + ' Gs';
}

/**
 * Calcula cuota mensual.
 * Fórmula: cuota = precio / cuotas  (sin interés)
 */
function calcCuota(precio, cuotas) {
  return precio / cuotas;
}

/**
 * Construye mensaje de WhatsApp URL-encoded.
 */
function buildMsg(asesor, modelo, cuotas, montoCuota) {
  var txt = 'Hola ' + asesor + '! Me interesa el ' + modelo +
            ' en ' + cuotas + ' cuotas de ' + montoCuota + '.';
  return encodeURIComponent(txt);
}

/* ============================================================
   CUOTERO AUTOMÁTICO
   ============================================================ */
function inicializarCuotero() {

  document.querySelectorAll('.cuotero').forEach(function(cuotero) {
    var precio   = parseFloat(cuotero.dataset.precio);
    var id       = cuotero.dataset.id;
    var botones  = cuotero.querySelectorAll('.cuota-btn');
    var elMonto  = document.getElementById('monto-' + id);
    var waBtn1   = document.getElementById('wa1-' + id);
    var waBtn2   = document.getElementById('wa2-' + id);
    var card     = cuotero.closest('.card');
    var modelo   = card ? card.querySelector('.card__name').textContent.trim() : 'el equipo';

    botones.forEach(function(btn) {
      btn.addEventListener('click', function() {

        var cuotas    = parseInt(btn.dataset.cuotas, 10);
        var montoCuota = calcCuota(precio, cuotas);
        var montoFmt   = formatGs(montoCuota);

        /* Actualizar monto en pantalla */
        if (elMonto) {
          elMonto.textContent = montoFmt;
          /* micro-animación flash */
          elMonto.classList.remove('monto-flash');
          void elMonto.offsetWidth;
          elMonto.classList.add('monto-flash');
        }

        /* Marcar botón activo */
        botones.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');

        /* Actualizar links de WhatsApp con cuotas y monto actualizados */
        if (waBtn1) {
          waBtn1.href = 'https://wa.me/' + WA_MATHEO + '?text=' +
                        buildMsg('Matheo', modelo, cuotas, montoFmt);
        }
        if (waBtn2) {
          waBtn2.href = 'https://wa.me/' + WA_JESUS + '?text=' +
                        buildMsg('Jesus', modelo, cuotas, montoFmt);
        }
      });
    });
  });
}

/* ============================================================
   ANIMACIÓN CSS FLASH para el monto al cambiar cuotas
   ============================================================ */
function inyectarFlash() {
  var s = document.createElement('style');
  s.textContent = '@keyframes flash-monto{0%{transform:scale(1.18);color:#fff}100%{transform:scale(1);color:var(--naranja-2)}}.monto-flash{animation:flash-monto .3s ease forwards}';
  document.head.appendChild(s);
}

/* ============================================================
   ACORDEÓN FAQ
   ============================================================ */
function inicializarFAQ() {
  document.querySelectorAll('.faq-pregunta').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var estaAbierto = btn.getAttribute('aria-expanded') === 'true';
      var respuesta   = btn.nextElementSibling;

      /* Cerrar todos los demás */
      document.querySelectorAll('.faq-pregunta').forEach(function(b) {
        b.setAttribute('aria-expanded', 'false');
        var r = b.nextElementSibling;
        if (r) r.classList.remove('abierta');
      });

      /* Abrir/cerrar el clickeado */
      if (!estaAbierto) {
        btn.setAttribute('aria-expanded', 'true');
        if (respuesta) respuesta.classList.add('abierta');
      }
    });
  });
}

/* ============================================================
   ANIMACIÓN SCROLL — cards entran al hacer scroll
   ============================================================ */
function animarCardsScroll() {
  if (!('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06 });

  document.querySelectorAll('.card').forEach(function(card) {
    card.style.animationPlayState = 'paused';
    observer.observe(card);
  });
}

/* ============================================================
   SMOOTH SCROLL para links internos
   ============================================================ */
function smoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      var dest = document.querySelector(a.getAttribute('href'));
      if (dest) { e.preventDefault(); dest.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
}

/* ============================================================
   INICIO
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
  inyectarFlash();
  inicializarCuotero();
  inicializarFAQ();
  animarCardsScroll();
  smoothScroll();
  console.log('✅ TechCell PY v2 — listo');
});
