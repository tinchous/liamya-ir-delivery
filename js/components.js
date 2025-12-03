// ===== COMPONENT LOADER =====
class ComponentLoader {
    static loadComponents() {
        ComponentLoader.initCart();
    }

    static initCart() {
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('cart-overlay');
        const floatingBtn = document.getElementById('cart-floating');
        const clearCartBtn = document.getElementById('clear-cart');
        const countEl = document.getElementById('cart-floating-count');
        const totalEl = document.getElementById('cart-total');
        const itemsEl = document.getElementById('cart-items');

        if (!sidebar || !floatingBtn) return;

        const toggleCart = () => {
            sidebar.classList.toggle('active');
        };

        floatingBtn.addEventListener('click', toggleCart);
        if (clearCartBtn) clearCartBtn.addEventListener('click', () => cartSystem.clear());

        // Render inicial
        cartSystem.subscribe((items) => {
            countEl.textContent = items.reduce((sum, item) => sum + item.quantity, 0);
            totalEl.textContent = "$" + cartSystem.getTotals().total.toFixed(2);

            if (itemsEl) {
                itemsEl.innerHTML = items.length === 0
                    ? '<p>Tu carrito está vacío</p>'
                    : items.map(item => `
                        <div style="margin-bottom: 8px;">
                            ${item.quantity}x ${item.nombre} - $${item.precio}
                        </div>
                    `).join('');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ComponentLoader.loadComponents();
});
