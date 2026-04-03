const productos = [
  { id:1,  nombre:"Taza cerámica artesanal",   cat:"Hogar",       precio:180, emoji:"☕", desc:"Hecha a mano, capacidad 350ml. Cada pieza es única por su proceso artesanal.", nuevo:false, popular:true },
  { id:2,  nombre:"Vela aromática de soja",     cat:"Hogar",       precio:120, emoji:"🕯", desc:"Aroma lavanda y vainilla, duración 40 horas. Cera 100% natural.", nuevo:true,  popular:false },
  { id:3,  nombre:"Cojín decorativo nórdico",   cat:"Hogar",       precio:220, emoji:"🛋", desc:"40×40cm, funda removible con cierre. Diseño escandinavo minimalista.", nuevo:false, popular:false },
  { id:4,  nombre:"Difusor de aromas",          cat:"Hogar",       precio:310, emoji:"🌿", desc:"Difusor ultrasónico con luz LED, 7 colores, temporizador y apagado automático.", nuevo:true,  popular:true },
  { id:5,  nombre:"Camiseta algodón premium",   cat:"Ropa",        precio:280, emoji:"👕", desc:"100% algodón peinado, corte unisex. Tallas S–XL. Varios colores disponibles.", nuevo:false, popular:true },
  { id:6,  nombre:"Gorra bordada artesanal",    cat:"Ropa",        precio:190, emoji:"🧢", desc:"Bordado a mano, ajustable, unisex. Diseños exclusivos de temporada.", nuevo:false, popular:false },
  { id:7,  nombre:"Bolsa tote de lona",         cat:"Ropa",        precio:150, emoji:"👜", desc:"Lona gruesa 12oz, asa larga reforzada. Ideal para el día a día.", nuevo:true,  popular:false },
  { id:8,  nombre:"Audífonos inalámbricos",     cat:"Electrónica", precio:650, emoji:"🎧", desc:"Bluetooth 5.0, batería 20h, cancelación activa de ruido. Estuche incluido.", nuevo:false, popular:true },
  { id:9,  nombre:"Cargador USB-C 65W",         cat:"Electrónica", precio:320, emoji:"🔌", desc:"Carga rápida GaN, compatible con laptop, tablet y celular. Cable incluido.", nuevo:false, popular:false },
  { id:10, nombre:"Soporte celular escritorio", cat:"Electrónica", precio:140, emoji:"📱", desc:"Aluminio anodizado, ajustable 360°. Compatible con todos los teléfonos.", nuevo:true,  popular:false },
  { id:11, nombre:"Agenda 2026",                cat:"Papelería",   precio:195, emoji:"📓", desc:"Tapa dura, semana vista, 200 páginas. Incluye stickers y marcapáginas.", nuevo:false, popular:true },
  { id:12, nombre:"Set bolígrafos de gel",      cat:"Papelería",   precio:85,  emoji:"🖊", desc:"12 colores, punta fina 0.5mm. Tinta de secado rápido, antideslizante.", nuevo:false, popular:false },
];

let carrito = [];
let catActiva = "Todos";

function getCats() {
  return ["Todos", ...new Set(productos.map(p => p.cat))];
}

function renderFiltros() {
  const el = document.getElementById("filtros");
  el.innerHTML = getCats().map(c => `
    <button class="filtro-btn ${c === catActiva ? 'active' : ''}" data-cat="${c}">${c}</button>
  `).join("");
  el.querySelectorAll(".filtro-btn").forEach(b => {
    b.addEventListener("click", () => {
      catActiva = b.dataset.cat;
      renderFiltros();
      renderProductos();
    });
  });
}

function renderProductos(busqueda = "") {
  const grid = document.getElementById("productos-grid");
  let lista = catActiva === "Todos" ? productos : productos.filter(p => p.cat === catActiva);
  if (busqueda) lista = lista.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  if (!lista.length) {
    grid.innerHTML = `<div class="sin-resultados">No encontramos "${busqueda}" 😕</div>`;
    return;
  }

  grid.innerHTML = lista.map((p, i) => {
    const enCarrito = carrito.find(c => c.id === p.id);
    return `
    <div class="producto-card" style="animation-delay:${i*0.05}s">
      <div class="card-visual">
        ${p.nuevo ? '<span class="card-tag nuevo">Nuevo</span>' : ''}
        ${p.popular ? '<span class="card-tag popular">Popular</span>' : ''}
        <div class="card-emoji">${p.emoji}</div>
      </div>
      <div class="card-info">
        <span class="card-cat">${p.cat}</span>
        <h3>${p.nombre}</h3>
        <p>${p.desc}</p>
        <div class="card-footer">
          <span class="card-precio">$${p.precio}</span>
          ${enCarrito
            ? `<div class="qty-ctrl">
                <button onclick="cambiarQty(${p.id},-1)">−</button>
                <span>${enCarrito.cantidad}</span>
                <button onclick="cambiarQty(${p.id},1)">+</button>
              </div>`
            : `<button class="btn-agregar" onclick="agregar(${p.id})">+ Agregar</button>`
          }
        </div>
      </div>
    </div>`;
  }).join("");
}

function agregar(id) {
  const prod = productos.find(p => p.id === id);
  const existe = carrito.find(c => c.id === id);
  if (existe) existe.cantidad++;
  else carrito.push({ ...prod, cantidad: 1 });
  actualizarCarrito();
  renderProductos(document.getElementById("buscador").value);
  mostrarToast();
}

function cambiarQty(id, delta) {
  const item = carrito.find(c => c.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) carrito = carrito.filter(c => c.id !== id);
  actualizarCarrito();
  renderProductos(document.getElementById("buscador").value);
}

function actualizarCarrito() {
  const count = carrito.reduce((a, c) => a + c.cantidad, 0);
  const total = carrito.reduce((a, c) => a + c.precio * c.cantidad, 0);
  document.getElementById("carrito-count").textContent = count;
  document.getElementById("carrito-count").classList.toggle("has-items", count > 0);
  document.getElementById("drawer-total").textContent = `$${total.toLocaleString()}`;

  const el = document.getElementById("drawer-items");
  if (!carrito.length) {
    el.innerHTML = `<div class="carrito-vacio"><span>🛒</span><p>Tu carrito está vacío</p></div>`;
    return;
  }
  el.innerHTML = carrito.map(c => `
    <div class="drawer-item">
      <div class="di-emoji">${c.emoji}</div>
      <div class="di-info">
        <p>${c.nombre}</p>
        <span>$${c.precio} c/u</span>
      </div>
      <div class="di-ctrl">
        <button onclick="cambiarQty(${c.id},-1)">−</button>
        <span>${c.cantidad}</span>
        <button onclick="cambiarQty(${c.id},1)">+</button>
      </div>
      <span class="di-subtotal">$${c.precio * c.cantidad}</span>
    </div>
  `).join("");
}

function mostrarToast() {
  const t = document.getElementById("toast");
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

document.getElementById("carrito-btn").addEventListener("click", () => {
  document.getElementById("carrito-drawer").classList.add("open");
  document.getElementById("overlay").classList.add("show");
});

function cerrarCarrito() {
  document.getElementById("carrito-drawer").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

document.getElementById("cerrar-carrito").addEventListener("click", cerrarCarrito);
document.getElementById("overlay").addEventListener("click", cerrarCarrito);

document.getElementById("btn-vaciar").addEventListener("click", () => {
  carrito = [];
  actualizarCarrito();
  renderProductos();
});

document.getElementById("btn-whatsapp").addEventListener("click", () => {
  if (!carrito.length) return alert("Tu carrito está vacío");
  const total = carrito.reduce((a, c) => a + c.precio * c.cantidad, 0);
  const lineas = carrito.map(c => `• ${c.emoji} ${c.nombre} ×${c.cantidad} = $${c.precio * c.cantidad}`).join("\n");
  const msg = `¡Hola! Quiero hacer un pedido 🛍\n\n${lineas}\n\n💰 Total: $${total.toLocaleString()}\n\n¿Tienen disponibilidad?`;
  window.open(`https://wa.me/5215512345678?text=${encodeURIComponent(msg)}`);
});

document.getElementById("buscador").addEventListener("input", e => renderProductos(e.target.value));

window.addEventListener("scroll", () => {
  document.getElementById("header").classList.toggle("scrolled", window.scrollY > 60);
});

window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("loader").classList.add("hidden"), 1800);
});

renderFiltros();
renderProductos();
actualizarCarrito();