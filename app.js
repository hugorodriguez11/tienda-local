const productos = [
  { id:1,  nombre:"Taza cerámica artesanal",   cat:"Hogar",       precio:180, emoji:"☕", desc:"Hecha a mano, capacidad 350ml, varios colores" },
  { id:2,  nombre:"Vela aromática soja",        cat:"Hogar",       precio:120, emoji:"🕯", desc:"Aroma lavanda, duración 40 horas" },
  { id:3,  nombre:"Cojín decorativo",           cat:"Hogar",       precio:220, emoji:"🛋", desc:"40x40cm, funda removible, varios diseños" },
  { id:4,  nombre:"Camiseta algodón premium",   cat:"Ropa",        precio:280, emoji:"👕", desc:"100% algodón, tallas S-XL, varios colores" },
  { id:5,  nombre:"Gorra bordada",              cat:"Ropa",        precio:190, emoji:"🧢", desc:"Ajustable, bordado artesanal, unisex" },
  { id:6,  nombre:"Bolsa tote de lona",         cat:"Ropa",        precio:150, emoji:"👜", desc:"Resistente, asa larga, diseño minimalista" },
  { id:7,  nombre:"Audífonos inalámbricos",     cat:"Electrónica", precio:650, emoji:"🎧", desc:"Bluetooth 5.0, batería 20h, cancelación ruido" },
  { id:8,  nombre:"Cargador USB-C 65W",         cat:"Electrónica", precio:320, emoji:"🔌", desc:"Carga rápida, compatible con laptop y celular" },
  { id:9,  nombre:"Soporte celular escritorio", cat:"Electrónica", precio:140, emoji:"📱", desc:"Aluminio, ajustable, compatible con todos los celulares" },
  { id:10, nombre:"Agenda 2026",                cat:"Papelería",   precio:195, emoji:"📓", desc:"Tapa dura, semana vista, 200 páginas" },
  { id:11, nombre:"Set bolígrafos de gel",      cat:"Papelería",   precio:85,  emoji:"🖊", desc:"12 colores, punta fina 0.5mm" },
  { id:12, nombre:"Planner mensual",            cat:"Papelería",   precio:130, emoji:"📅", desc:"Formato A4, 12 meses, papel 90g" },
];

let carrito = [];
let categoriaActiva = "Todos";

function getCategorias() {
  const cats = ["Todos", ...new Set(productos.map(p => p.cat))];
  return cats;
}

function renderFiltros() {
  const el = document.getElementById("filtros");
  el.innerHTML = getCategorias().map(cat => `
    <button class="filtro-btn ${cat === categoriaActiva ? 'active' : ''}" data-cat="${cat}">${cat}</button>
  `).join("");
  el.querySelectorAll(".filtro-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      categoriaActiva = btn.dataset.cat;
      renderFiltros();
      renderProductos();
    });
  });
}

function renderProductos(busqueda = "") {
  const grid = document.getElementById("productos-grid");
  let lista = categoriaActiva === "Todos" ? productos : productos.filter(p => p.cat === categoriaActiva);
  if (busqueda) lista = lista.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  if (lista.length === 0) {
    grid.innerHTML = `<div class="sin-resultados">No se encontraron productos 😕</div>`;
    return;
  }

  grid.innerHTML = lista.map(p => {
    const enCarrito = carrito.find(c => c.id === p.id);
    return `
    <div class="producto-card">
      <div class="producto-emoji">${p.emoji}</div>
      <div class="producto-info">
        <span class="producto-cat">${p.cat}</span>
        <h3>${p.nombre}</h3>
        <p>${p.desc}</p>
        <div class="producto-footer">
          <span class="producto-precio">$${p.precio}</span>
          ${enCarrito
            ? `<div class="cantidad-ctrl">
                <button onclick="cambiarCantidad(${p.id}, -1)">−</button>
                <span>${enCarrito.cantidad}</span>
                <button onclick="cambiarCantidad(${p.id}, 1)">+</button>
               </div>`
            : `<button class="btn-agregar" onclick="agregarCarrito(${p.id})">Agregar</button>`
          }
        </div>
      </div>
    </div>`;
  }).join("");
}

function agregarCarrito(id) {
  const prod = productos.find(p => p.id === id);
  const existe = carrito.find(c => c.id === id);
  if (existe) existe.cantidad++;
  else carrito.push({ ...prod, cantidad: 1 });
  actualizarCarrito();
  renderProductos(document.getElementById("buscador").value);
}

function cambiarCantidad(id, delta) {
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
  document.getElementById("carrito-total").textContent = `$${total}`;

  const itemsEl = document.getElementById("carrito-items");
  if (carrito.length === 0) {
    itemsEl.innerHTML = `<p class="carrito-vacio">Tu carrito está vacío</p>`;
    return;
  }
  itemsEl.innerHTML = carrito.map(c => `
    <div class="carrito-item">
      <span class="ci-emoji">${c.emoji}</span>
      <div class="ci-info">
        <p>${c.nombre}</p>
        <span>$${c.precio} × ${c.cantidad}</span>
      </div>
      <div class="ci-ctrl">
        <button onclick="cambiarCantidad(${c.id}, -1)">−</button>
        <span>${c.cantidad}</span>
        <button onclick="cambiarCantidad(${c.id}, 1)">+</button>
      </div>
    </div>
  `).join("");
}

function abrirCarrito() {
  document.getElementById("carrito-panel").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}

function cerrarCarrito() {
  document.getElementById("carrito-panel").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

document.getElementById("carrito-btn").addEventListener("click", abrirCarrito);
document.getElementById("cerrar-carrito").addEventListener("click", cerrarCarrito);
document.getElementById("overlay").addEventListener("click", cerrarCarrito);

document.getElementById("btn-vaciar").addEventListener("click", () => {
  carrito = [];
  actualizarCarrito();
  renderProductos();
});

document.getElementById("btn-whatsapp").addEventListener("click", () => {
  if (carrito.length === 0) return alert("Tu carrito está vacío");
  const total = carrito.reduce((a, c) => a + c.precio * c.cantidad, 0);
  const lineas = carrito.map(c => `• ${c.nombre} x${c.cantidad} = $${c.precio * c.cantidad}`).join("\n");
  const msg = `Hola! Quiero hacer un pedido:\n\n${lineas}\n\nTotal: $${total}\n\n¿Tienen disponibilidad?`;
  window.open(`https://wa.me/5215512345678?text=${encodeURIComponent(msg)}`);
});

document.getElementById("buscador").addEventListener("input", e => {
  renderProductos(e.target.value);
});

renderFiltros();
renderProductos();
actualizarCarrito();