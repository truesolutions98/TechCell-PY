# 📱 TechCell PY — Landing Page

Landing page moderna para venta de celulares en cuotas en Paraguay.  
Lista para publicar en **GitHub Pages** sin configuración adicional.

---

## 🚀 Publicar en GitHub Pages (paso a paso)

1. **Creá un repositorio nuevo** en [github.com](https://github.com) (ej: `mi-tienda-celulares`)
2. **Subí todos los archivos** de esta carpeta al repositorio
3. En GitHub, ir a **Settings → Pages**
4. En "Branch" seleccioná `main` y la carpeta `/ (root)`
5. Hacé clic en **Save**
6. En unos minutos tu página estará en:  
   `https://TU-USUARIO.github.io/mi-tienda-celulares/`

---

## 📁 Estructura del proyecto

```
landing-celulares/
├── index.html      ← Estructura de la página
├── style.css       ← Estilos (dark premium theme)
├── script.js       ← Cuotero automático + WhatsApp
├── README.md       ← Este archivo
└── images/         ← Carpeta para tus fotos (opcional)
```

---

## ✏️ Personalización rápida

### Cambiar número de WhatsApp
Abrí `script.js` y cambiá esta línea:
```js
const WA_NUMERO = '595981000000'; // ← tu número con código de país
```

### Cambiar nombre de la tienda
En `index.html` buscá `TechCell` y reemplazalo por el nombre de tu tienda.

### Agregar un celular nuevo
1. Copiá un bloque `<article class="card">` en `index.html`
2. Cambiá `data-precio="PRECIO_EN_GUARANIES"`
3. Actualizá los IDs con el número del nuevo producto:  
   `precio-total-7`, `num-cuotas-7`, `monto-cuota-7`, `wa-7`
4. Cambiá `data-producto="7"` en los 3 botones de cuotas
5. ¡Listo! El cuotero funciona automáticamente.

### Cambiar precios
Solo modificá el atributo `data-precio` de cada `<article class="card">`.

### Usar tus propias fotos
1. Copiá las imágenes a la carpeta `images/`
2. En el `<img src="...">` de cada tarjeta, cambiá la URL por:  
   `src="images/nombre-de-tu-foto.jpg"`

---

## 🧮 Fórmula del cuotero

```
cuota mensual = precio total / cantidad de cuotas
```
Sin interés. Si querés agregar interés, modificá la función `calcularCuota()` en `script.js`.

---

## 🛠 Tecnologías usadas

- HTML5 semántico
- CSS3 (variables, grid, flexbox, animaciones)
- JavaScript ES6+ vanilla
- Google Fonts (Bebas Neue + DM Sans)

Sin frameworks ni dependencias externas.

---

## 📞 Contacto / Soporte

Si necesitás ayuda para personalizar la tienda, escribinos a nuestro WhatsApp.
