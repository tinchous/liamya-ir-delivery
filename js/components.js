// ===== COMPONENT LOADER =====
class ComponentLoader {
    static async loadComponents() {
        const components = [
            { id: 'header-container', file: 'components/header.html' },
            { id: 'footer-container', file: 'components/footer.html' },
            { id: 'cart-container', file: 'components/cart-sidebar.html' }
        ];

        for (const component of components) {
            try {
                const response = await fetch(component.file);
                if (response.ok) {
                    const html = await response.text();
                    const container = document.getElementById(component.id);
                    if (container) {
                        container.innerHTML = html;

                        // If this is the cart, initialize it
                        if (component.id === 'cart-container') {
                            this.initCart();
                        }
                    }
                }
            } catch (error) {
                console.error(`Error loading ${component.file}:`, error);
            }
        }
    }

    static initCart() {
        // Cart toggle functionality
        const cartToggle = document.getElementById('cart-toggle');
        const cartClose = document.getElementById('cart-close');
        const cartOverlay = document.getElementById('cart-overlay');
        const cartFloating = document.getElementById('cart-floating');
        const clearCartBtn = document.getElementById('clear-cart');

        const toggleCart = () => {
            const sidebar = document.getElementById('cart-sidebar');
            sidebar.classList.toggle('active');
            cartOverlay.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
        };

        if (cartToggle) cartToggle.addEventListener('click', toggleCart);
        if (cartClose) cartClose.addEventListener('click', toggleCart);
        if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);
        if (cartFloating) cartFloating.addEventListener('click', toggleCart);

        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                if (cartSystem && cartSystem.items.length > 0) {
                    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
                        cartSystem.clear();
                    }
                }
            });
        }
    }
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ComponentLoader.loadComponents();
});
