/**
 * TechCell PY — script.js
 * ─────────────────────────────────────────────────────────────
 * Módulo principal: Cuotero automático + actualización de links WhatsApp
 *
 * HOW TO ADD A NEW PRODUCT:
 *   1. Copiá una tarjeta <article class="card"> en index.html
 *   2. Cambiá data-precio por el precio en guaraníes
 *   3. Actualizá los IDs: precio-total-N, num-cuotas-N, monto-cuota-N, wa-N
 *   4. Cambiá data-producto="N" en los tres botones de cuotas
 *   5. El cuotero funciona automáticamente sin tocar este archivo
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

/* ============================================================
   UTILIDADES
   ============================================================ */

/**
 * Formatea un número en formato paraguayo de guaraníes.
 * Ejemplo: 1990000 → "₲ 1.990.000"
 * @param {number} monto
 * @returns {string}
 */
function formatearGuaranies(monto) {
  const entero = Math.ceil(monto); // redondeo al guaraní superior
  return '₲ ' + entero.toLocaleString('es-PY');
}

/**
 * Calcula la cuota mensual sin interés.
 * Fórmula: cuota = precio / cantidad_cuotas
 * @param {number} precio       — precio total del producto
 * @param {number} cantCuotas   — cantidad de cuotas elegidas
 * @returns {number}
 */
function calcularCuota(precio, cantCuotas) {
  return precio / cantCuotas;
}

/**
 * Construye el mensaje de WhatsApp con los detalles del producto y cuotas.
 * @param {string} nombreProducto
 * @param {number} cantCuotas
 * @param {string} montoCuota — ya formateado
 * @returns {string} URL encoded
 */
function mensajeWhatsApp(nombreProducto, cantCuotas, montoCuota) {
  const texto = `Hola! Me interesa el ${nombreProducto} en ${cantCuotas} cuotas de ${montoCuota}.`;
  return encodeURIComponent(texto);
}

/* ============================================================
   NÚMERO DE WHATSAPP
   — Cambiá este número por el de tu tienda
   — Formato: código de país sin "+" seguido del número
   ============================================================ */
const WA_NUMERO = '595981000000';

/* ============================================================
   INICIALIZAR CUOTERO
   Se ejecuta al cargar la página y configura los botones de
   cuotas de todos los productos presentes en el HTML.
   ============================================================ */
function inicializarCuotero() {
  // Busca todos los botones de cuota en la página
  const botonesGrupo = document.querySelectorAll('.cuotero__btns');

  botonesGrupo.forEach(function(grupo) {
    const botones = grupo.querySelectorAll('.cuota-btn');

    botones.forEach(function(btn) {
      btn.addEventListener('click', function() {
        // ── Obtener datos del botón pulsado ──
        const idProducto  = btn.dataset.producto;
        const cantCuotas  = parseInt(btn.dataset.cuotas, 10);

        // ── Obtener precio del producto desde la tarjeta padre ──
        const tarjeta = btn.closest('.card');
        const precio  = parseFloat(tarjeta.dataset.precio);

        // ── Calcular cuota ──
        const cuotaMonto = calcularCuota(precio, cantCuotas);
        const montoFormateado = formatearGuaranies(cuotaMonto);

        // ── Actualizar UI: resultado del cuotero ──
        const elNumCuotas = document.getElementById('num-cuotas-' + idProducto);
        const elMonto     = document.getElementById('monto-cuota-' + idProducto);

        if (elNumCuotas) elNumCuotas.textContent = cantCuotas;
        if (elMonto)     elMonto.textContent     = montoFormateado;

        // ── Actualizar estado "activo" de los botones del mismo grupo ──
        botones.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');

        // ── Actualizar link de WhatsApp con cuotas actualizadas ──
        const linkWA      = document.getElementById('wa-' + idProducto);
        const nombreModel = tarjeta.querySelector('.card__name').textContent.trim();

        if (linkWA) {
          const msg = mensajeWhatsApp(nombreModel, cantCuotas, montoFormateado);
          linkWA.href = `https://wa.me/${WA_NUMERO}?text=${msg}`;
        }

        // ── Micro-animación en el monto actualizado ──
        if (elMonto) {
          elMonto.classList.remove('monto-flash');
          // forzar re-flow para reiniciar la animación
          void elMonto.offsetWidth;
          elMonto.classList.add('monto-flash');
        }
      });
    });
  });
}

/* ============================================================
   ANIMACIÓN CSS DINÁMICA para "monto-flash"
   Se inyecta una regla de keyframe para la transición del monto
   ============================================================ */
function inyectarAnimacionFlash() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes flash-monto {
      0%   { transform: scale(1.15); color: #fff; }
      100% { transform: scale(1);    color: var(--naranja-2); }
    }
    .monto-flash {
      animation: flash-monto .3s ease forwards;
    }
  `;
  document.head.appendChild(style);
}

/* ============================================================
   SMOOTH SCROLL — flecha del hero
   ============================================================ */
function configurarSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(enlace) {
    enlace.addEventListener('click', function(e) {
      const destino = document.querySelector(enlace.getAttribute('href'));
      if (destino) {
        e.preventDefault();
        destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ============================================================
   INTERSECTION OBSERVER — animar tarjetas al hacer scroll
   (refuerzo para navegadores que no soporten animation-delay
   combinado con opacity:0 inicial)
   ============================================================ */
function configurarAnimacionScroll() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.card').forEach(function(card) {
    card.style.animationPlayState = 'paused';
    observer.observe(card);
  });
}

/* ============================================================
   PUNTO DE ENTRADA
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
  inyectarAnimacionFlash();
  inicializarCuotero();
  configurarSmoothScroll();
  configurarAnimacionScroll();

  console.log('✅ TechCell PY — Cuotero iniciado correctamente');
});
