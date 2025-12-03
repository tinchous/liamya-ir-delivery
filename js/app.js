document.addEventListener('DOMContentLoaded', () => {
  // Cargar categorías (las 14)
  fetch('data/categorias.csv').then(r => r.text()).then(text => {
    const cats = text.split('\n').slice(1).filter(l => l.includes('TRUE'));
    const select = document.getElementById('category-filter');
    if (select) {
      select.innerHTML = '<option value="">Todas las categorías</option>' + cats.map(l => {
        const [id, nombre] = l.split(',');
        return `<option value="${nombre}">${nombre}</option>`;
      }).join('');
    }
  });

  // Filtros
  document.getElementById('category-filter')?.addEventListener('change', () => filterProducts());
  document.getElementById('search-input')?.addEventListener('input', () => filterProducts());
  document.getElementById('sort-filter')?.addEventListener('change', () => filterProducts());
});
