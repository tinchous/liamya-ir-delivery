document.addEventListener('DOMContentLoaded', () => {
    const destacadas = [
        { nombre: "ROTISERIA", icon: "🍗", color: "#ff4500" },
        { nombre: "FRUTAS/VERDURAS", icon: "🥬", color: "#00ff00" },
        { nombre: "BEBIDAS SIN ALCOHOL", icon: "🧋", color: "#00ffff" },
        { nombre: "SNACKS/DULCES", icon: "🍫", color: "#ff69b4" },
        { nombre: "PANADERIA", icon: "🥖", color: "#ffd700" },
        { nombre: "LACTEOS", icon: "🥛", color: "#ffffff" }
    ];

    const container = document.getElementById('categorias-destacadas') || 
                      document.querySelector('.categorias-destacadas') ||
                      document.createElement('div');

    container.innerHTML = '<h2 class="neon-title">🌟 Categorías Destacadas 🌟</h2>' + 
        destacadas.map(cat => `
            <a href="products.html?categoria=${cat.nombre}" class="categoria-card" style="background: linear-gradient(135deg, ${cat.color}22, ${cat.color}44); border: 2px solid ${cat.color};">
                <div class="icono-gigante">${cat.icon}</div>
                <h3>${cat.nombre.replace('/', ' & ')}</h3>
                <p>Ver productos →</p>
            </a>
        `).join('');

    if (!document.getElementById('categorias-destacadas')) {
        document.querySelector('main')?.insertAdjacentElement('afterbegin', container);
    }
});
