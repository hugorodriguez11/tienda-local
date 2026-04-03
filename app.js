// ── UTILIDADES ──────────────────────────────────────────────
const $ = id => document.getElementById(id);
const fmt = n => '$' + Number(n).toLocaleString('es-MX', {minimumFractionDigits:0});
const pagina = location.pathname.split('/').pop() || 'index.html';

// ── TEMA ────────────────────────────────────────────────────
function initTema() {
  const guardado = localStorage.getItem('tema') || 'light';
  document.documentElement.setAttribute('data-theme', guardado);
  actualizarIconoTema(guardado);
}

function actualizarIconoTema(tema) {
  const btn = $('theme-toggle');
  if (btn) btn.textContent = tema === 'dark' ? '☀️' : '🌙';
}

document.addEventListener('DOMContentLoaded', () => {
  initTema();
  const btn = $('theme-toggle');
  if (btn) btn.addEventListener('click', () => {
    const actual = document.documentElement.getAttribute('data-theme');
    const nuevo = actual === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nuevo);
    localStorage.setItem('tema', nuevo);
    actualizarIconoTema(nuevo);
  });
});

// ── CARRITO ─────────────────────────────────────────────────
function getCarrito() { return JSON.parse(localStorage.getItem('carrito') || '[]'); }
function setCarrito(c) { localStorage.setItem('carrito', JSON.stringify(c)); }

function agregarAlCarrito(id, cantidad = 1) {
  const carrito = getCarrito();
  const existe = carrito.find(c => c.id === id);
  if (existe) existe.cantidad += cantidad;
  else carrito.push({ id, cantidad });
  setCarrito(carrito);
  actualizarBadge();
  mostrarToast('Producto agregado al carrito ✓');
}

function actualizarBadge() {
  const carrito = getCarrito();
  const total = carrito.reduce((a, c) => a + c.cantidad, 0);
  const badge = $('badge-count');
  if (badge) badge.textContent = total;
}

function mostrarToast(msg) {
  let t = document.querySelector('.toast-global');
  if (!t) { t = document.createElement('div'); t.className = 'toast-global'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── TARJETAS DE PRODUCTO ─────────────────────────────────────
function renderStars(rating) {
  return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(rating));
}

function crearCard(p) {
  const descuento = p.precioOriginal ? Math.round((1 - p.precio / p.precioOriginal) * 100) : 0;
  return `
  <div class="prod-card" onclick="location.href='producto.html?id=${p.id}'">
    <div class="prod-img-wrap">
      ${p.badge ? `<span class="prod-badge">${p.badge}</span>` : ''}
      ${descuento ? `<span class="prod-descuento">-${descuento}%</span>` : ''}
      <img src="${p.img}" alt="${p.nombre}" loading="lazy">
    </div>
    <div class="prod-info">
      <p class="prod-cat">${categorias.find(c=>c.id===p.cat)?.nombre || p.cat}</p>
      <h3 class="prod-nombre">${p.nombre}</h3>
      <div class="prod-rating">
        <span class="stars-sm">${renderStars(p.rating)}</span>
        <span class="rating-num">${p.rating} (${p.reviews.toLocaleString()})</span>
      </div>
      <div class="prod-precios">
        <span class="precio-actual">${fmt(p.precio)}</span>
        ${p.precioOriginal ? `<span class="precio-tachado">${fmt(p.precioOriginal)}</span>` : ''}
      </div>
      <button class="btn-card-agregar" onclick="event.stopPropagation();agregarAlCarrito(${p.id})">+ Agregar</button>
    </div>
  </div>`;
}

// ── INDEX ────────────────────────────────────────────────────
if (pagina === 'index.html' || pagina === '') {
  document.addEventListener('DOMContentLoaded', () => {
    actualizarBadge();
    let catFiltro = null;

    const catsNav = $('cats-nav');
    if (catsNav) {
      catsNav.innerHTML = `<a class="cat-nav-item active" data-cat="null" onclick="filtrarCat(null,this)">Todos</a>` +
        categorias.map(c => `<a class="cat-nav-item" onclick="filtrarCat('${c.id}',this)">${c.icono} ${c.nombre}</a>`).join('');
    }

    const catsGrid = $('cats-grid');
    if (catsGrid) {
      catsGrid.innerHTML = categorias.map(c => `
        <div class="cat-card" onclick="filtrarCat('${c.id}', null, true)">
          <span class="cat-card-icon">${c.icono}</span>
          <span>${c.nombre}</span>
        </div>`).join('');
    }

    window.filtrarCat = (cat, el, scroll) => {
      catFiltro = cat;
      document.querySelectorAll('.cat-nav-item').forEach(b => b.classList.remove('active'));
      if (el) el.classList.add('active');
      const titulo = $('titulo-seccion');
      if (titulo) titulo.textContent = cat ? categorias.find(c=>c.id===cat)?.nombre : 'Todos los productos';
      renderProductos();
      if (scroll) document.querySelector('#productos')?.scrollIntoView({behavior:'smooth'});
    };

    function renderProductos() {
      const grid = $('productos-grid');
      if (!grid) return;
      let lista = catFiltro ? productos.filter(p => p.cat === catFiltro) : [...productos];
      const busq = $('buscador')?.value.toLowerCase();
      if (busq) lista = lista.filter(p => p.nombre.toLowerCase().includes(busq) || p.descripcion.toLowerCase().includes(busq));
      const sort = $('sort-select')?.value;
      if (sort === 'precio-asc') lista.sort((a,b) => a.precio - b.precio);
      if (sort === 'precio-desc') lista.sort((a,b) => b.precio - a.precio);
      if (sort === 'rating') lista.sort((a,b) => b.rating - a.rating);
      grid.innerHTML = lista.map(crearCard).join('');
    }

    $('buscador')?.addEventListener('input', renderProductos);
    $('sort-select')?.addEventListener('change', renderProductos);
    renderProductos();
  });
}

// ── PRODUCTO DETALLE ─────────────────────────────────────────
if (pagina === 'producto.html') {
  document.addEventListener('DOMContentLoaded', () => {
    actualizarBadge();
    const params = new URLSearchParams(location.search);
    const id = parseInt(params.get('id'));
    const p = productos.find(x => x.id === id);
    if (!p) { location.href = 'index.html'; return; }

    const cat = categorias.find(c => c.id === p.cat);
    $('bc-cat').textContent = cat?.nombre || p.cat;
    $('bc-nombre').textContent = p.nombre;
    $('detalle-img').src = p.img;
    $('detalle-img').alt = p.nombre;
    if (p.badge) { $('detalle-badge').textContent = p.badge; $('detalle-badge').style.display='inline-block'; }
    $('detalle-cat').textContent = cat?.nombre || p.cat;
    $('detalle-nombre').textContent = p.nombre;
    $('detalle-stars').textContent = renderStars(p.rating);
    $('detalle-reviews').textContent = `${p.rating} · ${p.reviews.toLocaleString()} reseñas`;
    $('detalle-precio').textContent = fmt(p.precio);
    if (p.precioOriginal) {
      $('detalle-original').textContent = fmt(p.precioOriginal);
      const desc = Math.round((1 - p.precio/p.precioOriginal)*100);
      $('detalle-descuento').textContent = `-${desc}% OFF`;
      $('detalle-descuento').style.display = 'inline-block';
    }
    $('detalle-desc').textContent = p.descripcion;
    $('detalle-specs').innerHTML = p.specs.map(s=>`<li>✓ ${s}</li>`).join('');
    const stockEl = $('detalle-stock');
    stockEl.textContent = p.stock <= 5 ? `⚠️ ¡Solo quedan ${p.stock} en stock!` : `✅ En stock (${p.stock} disponibles)`;
    stockEl.className = 'detalle-stock ' + (p.stock <= 5 ? 'stock-bajo' : 'stock-ok');

    let qty = 1;
    $('qty-minus').addEventListener('click', () => { if (qty > 1) { qty--; $('qty-val').textContent = qty; } });
    $('qty-plus').addEventListener('click', () => { if (qty < p.stock) { qty++; $('qty-val').textContent = qty; } });
    $('btn-agregar').addEventListener('click', () => agregarAlCarrito(p.id, qty));
    $('btn-comprar').addEventListener('click', () => { agregarAlCarrito(p.id, qty); location.href='checkout.html'; });

    const rel = productos.filter(x => x.cat === p.cat && x.id !== p.id).slice(0,4);
    $('relacionados-grid').innerHTML = rel.map(crearCard).join('');
  });
}

// ── CARRITO PAGE ─────────────────────────────────────────────
if (pagina === 'carrito.html') {
  document.addEventListener('DOMContentLoaded', () => {
    let descuentoAplicado = 0;
    const CUPONES = { 'HUGO10': 10, 'SHOPМX20': 20, 'BIENVENIDO': 15 };

    function calcEnvio(subtotal) { return subtotal >= 999 ? 0 : 99; }

    function renderCarrito() {
      const carrito = getCarrito();
      const col = $('carrito-items-col');
      if (!carrito.length) {
        col.innerHTML = `<div class="carrito-vacio"><span>🛒</span><h3>Tu carrito está vacío</h3><a href="index.html" class="btn-continuar">Explorar productos</a></div>`;
        actualizarResumen(0, 0, 0);
        return;
      }
      col.innerHTML = carrito.map(item => {
        const p = productos.find(x => x.id === item.id);
        if (!p) return '';
        return `
        <div class="carrito-item-card">
          <img src="${p.img}" alt="${p.nombre}" onclick="location.href='producto.html?id=${p.id}'">
          <div class="cic-info">
            <p class="cic-nombre" onclick="location.href='producto.html?id=${p.id}'">${p.nombre}</p>
            <p class="cic-cat">${categorias.find(c=>c.id===p.cat)?.nombre}</p>
            <div class="cic-acciones">
              <div class="qty-ctrl">
                <button onclick="cambiarQty(${p.id},-1)">−</button>
                <span>${item.cantidad}</span>
                <button onclick="cambiarQty(${p.id},1)">+</button>
              </div>
              <button class="btn-eliminar" onclick="eliminarItem(${p.id})">🗑 Eliminar</button>
            </div>
          </div>
          <div class="cic-precio">
            <strong>${fmt(p.precio * item.cantidad)}</strong>
            ${item.cantidad > 1 ? `<small>${fmt(p.precio)} c/u</small>` : ''}
          </div>
        </div>`;
      }).join('');
      const subtotal = carrito.reduce((a,c) => { const p=productos.find(x=>x.id===c.id); return a+(p?p.precio*c.cantidad:0); },0);
      const envio = calcEnvio(subtotal);
      actualizarResumen(subtotal, envio, descuentoAplicado);
      actualizarBadge();
    }

    function actualizarResumen(sub, envio, desc) {
      $('r-subtotal').textContent = fmt(sub);
      $('r-envio').textContent = envio === 0 ? 'Gratis' : fmt(envio);
      const descMonto = Math.round(sub * desc / 100);
      if (desc > 0) {
        $('r-descuento-row').style.display='flex';
        $('r-descuento').textContent = `-${fmt(descMonto)}`;
      }
      $('r-total').textContent = fmt(sub + envio - descMonto);
    }

    window.cambiarQty = (id, delta) => {
      const carrito = getCarrito();
      const item = carrito.find(c=>c.id===id);
      if (!item) return;
      item.cantidad += delta;
      if (item.cantidad <= 0) carrito.splice(carrito.indexOf(item),1);
      setCarrito(carrito);
      renderCarrito();
    };

    window.eliminarItem = id => {
      const carrito = getCarrito().filter(c=>c.id!==id);
      setCarrito(carrito);
      renderCarrito();
    };

    $('cupon-btn').addEventListener('click', () => {
      const code = $('cupon-input').value.trim().toUpperCase();
      const msg = $('cupon-msg');
      if (CUPONES[code]) {
        descuentoAplicado = CUPONES[code];
        msg.textContent = `✅ Cupón aplicado: ${descuentoAplicado}% de descuento`;
        msg.className = 'cupon-msg success';
        renderCarrito();
      } else {
        msg.textContent = '❌ Cupón inválido o expirado';
        msg.className = 'cupon-msg error';
      }
    });

    renderCarrito();
    actualizarBadge();
  });
}

// ── CHECKOUT ─────────────────────────────────────────────────
if (pagina === 'checkout.html') {
  document.addEventListener('DOMContentLoaded', () => {
    let envioSeleccionado = 0;

    function renderResumen() {
      const carrito = getCarrito();
      const subtotal = carrito.reduce((a,c)=>{const p=productos.find(x=>x.id===c.id);return a+(p?p.precio*c.cantidad:0);},0);
      $('checkout-items').innerHTML = carrito.map(item => {
        const p = productos.find(x=>x.id===item.id);
        return p ? `<div class="ci-resumen"><img src="${p.img}" alt="${p.nombre}"><div><p>${p.nombre}</p><span>×${item.cantidad}</span></div><strong>${fmt(p.precio*item.cantidad)}</strong></div>` : '';
      }).join('');
      $('cr-subtotal').textContent = fmt(subtotal);
      $('cr-envio').textContent = envioSeleccionado === 0 ? 'Gratis' : fmt(envioSeleccionado);
      $('cr-total').textContent = fmt(subtotal + envioSeleccionado);
    }

    document.querySelectorAll('input[name="envio"]').forEach(r => {
      r.addEventListener('change', () => {
        const vals = { estandar:0, express:149, 'mismo-dia':249 };
        envioSeleccionado = vals[r.value] || 0;
        renderResumen();
      });
    });

    $('btn-a-pago').addEventListener('click', () => {
      const campos = ['c-nombre','c-apellido','c-email','c-dir','c-ciudad','c-estado','c-cp'];
      const vacio = campos.find(id => !$(id)?.value.trim());
      if (vacio) { mostrarToast('Por favor completa todos los campos obligatorios'); return; }
      $('seccion-envio').style.display = 'none';
      $('seccion-pago').style.display = 'block';
      $('step2').classList.add('active');
      $('ef-codigo').textContent = 'SHOPМX-' + Math.random().toString(36).substr(2,6).toUpperCase();
      window.scrollTo({top:0,behavior:'smooth'});
    });

    $('btn-volver-envio').addEventListener('click', () => {
      $('seccion-envio').style.display = 'block';
      $('seccion-pago').style.display = 'none';
      $('step2').classList.remove('active');
    });

    document.querySelectorAll('.metodo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.metodo-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        ['form-tarjeta','form-paypal','form-efectivo'].forEach(id => $(id).style.display='none');
        $('form-'+btn.dataset.metodo).style.display = 'block';
      });
    });

    const tNum = $('t-numero');
    if (tNum) {
      tNum.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g,'').substring(0,16);
        e.target.value = v.replace(/(.{4})/g,'$1 ').trim();
        $('tv-numero').textContent = v.padEnd(16,'•').replace(/(.{4})/g,'$1 ').trim();
      });
    }
    $('t-nombre')?.addEventListener('input', e => { $('tv-nombre').textContent = e.target.value.toUpperCase() || 'NOMBRE APELLIDO'; });
    $('t-expira')?.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g,'');
      if (v.length >= 3) v = v.substring(0,2)+'/'+v.substring(2);
      e.target.value = v;
      $('tv-expira').textContent = v || 'MM/AA';
    });

    $('btn-pagar').addEventListener('click', () => {
      const metodo = document.querySelector('.metodo-btn.active')?.dataset.metodo;
      if (metodo === 'tarjeta') {
        if (!$('t-numero')?.value || !$('t-nombre')?.value || !$('t-expira')?.value || !$('t-cvv')?.value) {
          mostrarToast('Por favor completa los datos de tu tarjeta'); return;
        }
      }
      if (metodo === 'paypal' && !$('pp-email')?.value) {
        mostrarToast('Por favor ingresa tu correo de PayPal'); return;
      }
      const num = 'SHOPМX-' + Math.random().toString(36).substr(2,8).toUpperCase();
      localStorage.setItem('ultimo-pedido', JSON.stringify({
        numero: num,
        metodo,
        nombre: $('c-nombre')?.value + ' ' + $('c-apellido')?.value,
        email: $('c-email')?.value,
        direccion: $('c-dir')?.value + ', ' + $('c-col')?.value + ', ' + $('c-ciudad')?.value,
        items: getCarrito(),
        total: $('cr-total')?.textContent
      }));
      setCarrito([]);
      location.href = 'confirmacion.html';
    });

    renderResumen();
    actualizarBadge();
  });
}

// ── CONFIRMACIÓN ─────────────────────────────────────────────
if (pagina === 'confirmacion.html') {
  document.addEventListener('DOMContentLoaded', () => {
    const pedido = JSON.parse(localStorage.getItem('ultimo-pedido') || '{}');
    if (!pedido.numero) { location.href='index.html'; return; }
    $('conf-numero').textContent = pedido.numero;
    const metodos = { tarjeta:'💳 Tarjeta de crédito/débito', paypal:'🅿️ PayPal', efectivo:'💵 Efectivo en tienda' };
    $('conf-detalles').innerHTML = `
      <div class="conf-row"><span>Nombre</span><strong>${pedido.nombre}</strong></div>
      <div class="conf-row"><span>Correo</span><strong>${pedido.email}</strong></div>
      <div class="conf-row"><span>Dirección</span><strong>${pedido.direccion}</strong></div>
      <div class="conf-row"><span>Método de pago</span><strong>${metodos[pedido.metodo]||pedido.metodo}</strong></div>
      <div class="conf-row"><span>Total pagado</span><strong>${pedido.total}</strong></div>
    `;
    setTimeout(() => {
      document.querySelectorAll('.tl-item').forEach((el,i) => {
        setTimeout(() => el.classList.add('active'), i * 600);
      });
    }, 500);
    actualizarBadge();
  });
}

// Init badge en todas las páginas
actualizarBadge();