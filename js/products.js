async function cargarProductos() {
  const contenedor = document.getElementById('productos-container');
  const buscador = document.getElementById('buscador');

  try {
    const res = await fetch('/.netlify/functions/get-products');
    const productos = await res.json();

    let lista = productos;
    renderProductos(lista);

    buscador.addEventListener('input', e => {
      const texto = e.target.value.toLowerCase();
      const filtrados = lista.filter(p =>
        p.nombre.toLowerCase().includes(texto) ||
        (p.marca || '').toLowerCase().includes(texto)
      );
      renderProductos(filtrados);
    });
  } catch (error) {
    console.error('❌ Error cargando productos:', error);
    contenedor.innerHTML = `<p style="color:red;">Error al cargar productos.</p>`;
  }
}

function renderProductos(productos) {
  const contenedor = document.getElementById('productos-container');
  contenedor.innerHTML = '';

  if (!productos.length) {
    contenedor.innerHTML = `<p>No se encontraron productos.</p>`;
    return;
  }

  productos.forEach(p => {
    const card = document.createElement('div');
    card.classList.add('producto-card');

    const etiquetas = [];
    if (p.oferta) etiquetas.push('<span class="etiqueta-oferta">OFERTA</span>');
    if (p.nuevo) etiquetas.push('<span class="etiqueta-nuevo">NUEVO</span>');
    if (p.mas_vendido) etiquetas.push('<span class="etiqueta-mas-vendido">+VENDIDO</span>');

    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p>${p.marca || ''}</p>
      <div class="etiquetas">${etiquetas.join(' ')}</div>
      <p class="precio">$${p.precio?.toFixed(2) || '0.00'}</p>
    `;

    contenedor.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', cargarProductos);
