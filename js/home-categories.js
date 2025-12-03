document.addEventListener('DOMContentLoaded', () => {
    const destacadas = [
        { nombre: "ROTISERIA", icon: "🍗", color: "#ff4500", productos: 28 },
        { nombre: "FRUTAS/VERDURAS", icon: "🥬🍓", color: "#00ff00", productos: 45 },
        { nombre: "PANADERIA", icon: "🥖🥐", color: "#ffd700", productos: 32 },
        { nombre: "BEBIDAS SIN ALCOHOL", icon: "🧋🥤", color: "#00ffff", productos: 67 },
        { nombre: "LACTEOS", icon: "🥛🧀", color: "#ffffff", productos: 41 },
        { nombre: "SNACKS/DULCES", icon: "🍫🍿", color: "#ff69b4", productos: 58 }
    ];

    let container = document.getElementById('categorias-destacadas');
    if (!container) {
        container = document.createElement('section');
        container.id = 'categorias-destacadas';
        container.style.cssText = 'padding:2rem 1rem; max-width:1400px; margin:0 auto;';
        document.querySelector('main')?.appendChild(container);
    }

    container.innerHTML = `
        <h2 style="text-align:center; font-size:3rem; background:linear-gradient(90deg,#00ffff,#ff00ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent; margin:3rem 0 2rem;">
            🔥 CATEGORÍAS DESTACADAS 🔥
        </h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:2rem;">
            ${destacadas.map(cat => `
                <a href="products.html?categoria=${cat.nombre}" 
                   style="background:rgba(255,255,255,0.05); border:3px solid ${cat.color}; border-radius:24px; padding:2rem; text-align:center; text-decoration:none; color:white; transition:all 0.4s; box-shadow:0 0 30px ${cat.color}40;"
                   onmouseover="this.style.transform='translateY(-20px) scale(1.08)'; this.style.boxShadow='0 0 60px ${cat.color}80'"
                   onmouseout="this.style.transform=''; this.style.boxShadow='0 0 30px ${cat.color}40'">
                    <div style="font-size:5rem; margin-bottom:1rem;">${cat.icon}</div>
                    <h3 style="font-size:1.8rem; margin:1rem 0;">${cat.nombre.replace('/', ' & ')}</h3>
                    <p style="font-size:1.2rem; opacity:0.9;">${cat.productos} productos disponibles</p>
                    <p style="margin-top:1rem; color:${cat.color}; font-weight:bold;">VER AHORA →</p>
                </a>
            `).join('')}
        </div>
    `;
});
