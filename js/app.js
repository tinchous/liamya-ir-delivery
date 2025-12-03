// ===== APP CONFIGURATION =====
const AppConfig = {
    apiBase: 'data/',
    deliveryCost: 50,
    freeDeliveryThreshold: 1500,
    currency: '$',
    storeName: 'Autoservice Liam Yahir',
    storePhone: '+59892308828',
    storeAddress: 'Alejandro Fiol de Pereda 1251, Montevideo',
    storeHours: '24/7 (excepto martes 00:00-08:00)',
    deliveryHours: '08:00 - 23:30',
    deliveryBrand: 'LiamYA'
};

// ===== STATE MANAGEMENT =====
const AppState = {
    user: null,
    cart: [],
    products: [],
    categories: [],
    filters: {
        category: '',
        search: '',
        sort: '',
        priceRange: [0, 10000]
    },
    currentPage: 1,
    itemsPerPage: 200, // Mostrar todos los productos
    showAllProducts: true,
    productQuantities: {} // Para almacenar cantidades por producto
};

// ===== DOM ELEMENTS =====
const DOM = {
    header: document.querySelector('.main-header'),
    cartSidebar: document.getElementById('cart-sidebar'),
    cartOverlay: document.getElementById('cart-overlay'),
    cartToggle: document.getElementById('cart-toggle'),
    cartClose: document.getElementById('cart-close'),
    cartItems: document.getElementById('cart-items'),
    cartSubtotal: document.getElementById('cart-subtotal'),
    cartDelivery: document.getElementById('cart-delivery'),
    cartTotal: document.getElementById('cart-total'),
    cartFloating: document.getElementById('cart-floating'),
    cartFloatingCount: document.getElementById('cart-floating-count'),
    clearCartBtn: document.getElementById('clear-cart'),
    menuToggle: document.getElementById('menu-toggle'),
    mainNav: document.querySelector('.main-nav'),
    searchInput: document.getElementById('search-input'),
    categoryFilter: document.getElementById('category-filter'),
    sortFilter: document.getElementById('sort-filter'),
    priceFilter: document.getElementById('price-filter')
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadInitialData();
});

// ===== APP INITIALIZATION =====
function initializeApp() {
    // Load user from localStorage
    const savedUser = localStorage.getItem('autoservice_user');
    if (savedUser) {
        AppState.user = JSON.parse(savedUser);
        updateUserUI();
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('autoservice_cart');
    if (savedCart) {
        AppState.cart = JSON.parse(savedCart);
        updateCartUI();
    }

    // Set current category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        AppState.filters.category = category;
        if (DOM.categoryFilter) {
            DOM.categoryFilter.value = category;
        }
    }

    // Initialize mobile menu
    initMobileMenu();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Cart toggle
    if (DOM.cartToggle) {
        DOM.cartToggle.addEventListener('click', toggleCart);
    }

    if (DOM.cartClose) {
        DOM.cartClose.addEventListener('click', toggleCart);
    }

    if (DOM.cartOverlay) {
        DOM.cartOverlay.addEventListener('click', toggleCart);
    }

    if (DOM.cartFloating) {
        DOM.cartFloating.addEventListener('click', toggleCart);
    }

    // Clear cart
    if (DOM.clearCartBtn) {
        DOM.clearCartBtn.addEventListener('click', clearCart);
    }

    // Mobile menu toggle
    if (DOM.menuToggle) {
        DOM.menuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu on link click
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMobileMenu(false);
            }
        });
    });

    // Search functionality
    if (DOM.searchInput) {
        DOM.searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Filter changes
    if (DOM.categoryFilter) {
        DOM.categoryFilter.addEventListener('change', handleCategoryFilter);
    }

    if (DOM.sortFilter) {
        DOM.sortFilter.addEventListener('change', handleSortFilter);
    }

    if (DOM.priceFilter) {
        DOM.priceFilter.addEventListener('input', debounce(handlePriceFilter, 300));
    }

    // Pagination
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-btn')) {
            const page = parseInt(e.target.dataset.page);
            handlePageChange(page);
        }
    });
}

// ===== DATA LOADING =====
async function loadInitialData() {
    try {
        console.log('📦 Cargando productos...');

        // Load products
        const productsResponse = await fetch(`${AppConfig.apiBase}productos.json`);
        if (!productsResponse.ok) {
            throw new Error(`HTTP error! status: ${productsResponse.status}`);
        }

        const productsData = await productsResponse.json();
        AppState.products = productsData.productos || [];

        console.log(`✅ ${AppState.products.length} productos cargados`);

        if (AppState.products.length === 0) {
            console.warn('⚠️ No se encontraron productos en el JSON');
            showNotification('No se encontraron productos', 'error');
            return;
        }

        // Load categories from products
        const categories = [...new Set(AppState.products.map(p => p.categoria))].filter(Boolean);
        AppState.categories = categories.map((cat, index) => ({
            id: index + 1,
            nombre: cat,
            count: AppState.products.filter(p => p.categoria === cat).length
        }));

        console.log(`✅ ${AppState.categories.length} categorías encontradas`);

        // Check if we're on products page
        const isProductsPage = document.querySelector('.products-grid') !== null;
        const isHomePage = document.querySelector('.categories-grid') !== null;

        // Initialize UI based on current page
        if (isProductsPage) {
            console.log('🔄 Inicializando página de productos...');
            renderCategories();
            renderProducts();
            updateProductCounts();

            // Apply URL category filter if present
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            if (category && DOM.categoryFilter) {
                console.log(`🎯 Aplicando filtro de categoría desde URL: ${category}`);
                AppState.filters.category = category;
                DOM.categoryFilter.value = category;
                renderProducts();
            }
        }

        if (isHomePage) {
            console.log('🔄 Inicializando página de inicio...');
            renderCategoryCards();
        }

        // Update cart UI
        updateCartUI();

        console.log('✅ Sistema inicializado correctamente');

    } catch (error) {
        console.error('❌ Error cargando datos:', error);
        showNotification('Error al cargar los productos', 'error');

        // Show error message on products page
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding:4rem 2rem; color:#ff4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size:3rem; margin-bottom:1rem;"></i>
                    <h3>Error al cargar los productos</h3>
                    <p>No se pudieron cargar los productos. Por favor, recarga la página.</p>
                    <button onclick="window.location.reload()" class="btn-primary">
                        <i class="fas fa-redo"></i> Recargar página
                    </button>
                </div>
            `;
        }
    }
}

// ===== CART FUNCTIONS =====
function addToCart(product, quantity = 1) {
    const existingItem = AppState.cart.find(item => item.codigo === product.codigo);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        AppState.cart.push({
            ...product,
            quantity: quantity
        });
    }

    saveCart();
    updateCartUI();
    showNotification(`${product.nombre} agregado al carrito`);

    // Animation
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.classList.add('pulse');
        setTimeout(() => cartBtn.classList.remove('pulse'), 300);
    }
}

function removeFromCart(productCode) {
    AppState.cart = AppState.cart.filter(item => item.codigo !== productCode);
    saveCart();
    updateCartUI();
    showNotification('Producto removido del carrito');
}

function updateCartItem(productCode, quantity) {
    const item = AppState.cart.find(item => item.codigo === productCode);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productCode);
        } else {
            item.quantity = quantity;
            saveCart();
            updateCartUI();
        }
    }
}

function clearCart() {
    if (AppState.cart.length === 0) return;

    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        AppState.cart = [];
        saveCart();
        updateCartUI();
        showNotification('Carrito vaciado');
    }
}

function saveCart() {
    localStorage.setItem('autoservice_cart', JSON.stringify(AppState.cart));
}

// ===== CART UI UPDATES =====
function updateCartUI() {
    // Update cart count
    const totalItems = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);

    if (DOM.cartFloatingCount) {
        DOM.cartFloatingCount.textContent = totalItems;
    }

    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
    });

    // Update sidebar if open
    if (DOM.cartItems) {
        renderCartItems();
        updateCartSummary();
    }

    // Update checkout summary if on checkout page
    if (document.getElementById('checkout-items')) {
        renderCheckoutItems();
        updateCheckoutSummary();
    }
}

function renderCartItems() {
    if (!DOM.cartItems) return;

    if (AppState.cart.length === 0) {
        DOM.cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
                <a href="products.html" class="btn-small">Ver productos</a>
            </div>
        `;
        return;
    }

    DOM.cartItems.innerHTML = AppState.cart.map(item => `
        <div class="cart-item" data-id="${item.codigo}">
            <img src="${item.imagen || 'images/products/placeholder.png'}"
                 alt="${item.nombre}"
                 class="cart-item-img"
                 onerror="this.src='images/products/placeholder.png'">

            <div class="cart-item-info">
                <div class="cart-item-name">${item.nombre}</div>
                <div class="cart-item-price">${AppConfig.currency}${item.precio}</div>
            </div>

            <div class="cart-item-controls">
                <div class="cart-item-qty">
                    <button class="qty-btn minus" onclick="updateCartItemQty('${item.codigo}', ${item.quantity - 1})">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn plus" onclick="updateCartItemQty('${item.codigo}', ${item.quantity + 1})">+</button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.codigo}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function updateCartItemQty(productCode, quantity) {
    updateCartItem(productCode, quantity);
}

function updateCartSummary() {
    if (!DOM.cartSubtotal || !DOM.cartDelivery || !DOM.cartTotal) return;

    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    const delivery = subtotal >= AppConfig.freeDeliveryThreshold ? 0 : AppConfig.deliveryCost;
    const total = subtotal + delivery;

    DOM.cartSubtotal.textContent = `${AppConfig.currency}${subtotal.toFixed(2)}`;
    DOM.cartDelivery.textContent = `${AppConfig.currency}${delivery.toFixed(2)}`;
    DOM.cartTotal.textContent = `${AppConfig.currency}${total.toFixed(2)}`;

    // Update delivery message
    const deliveryMessage = document.getElementById('delivery-message');
    if (deliveryMessage) {
        if (delivery === 0) {
            deliveryMessage.innerHTML = `<span style="color:#00ff00;">¡Envío gratis!</span>`;
        } else {
            const needed = AppConfig.freeDeliveryThreshold - subtotal;
            if (needed > 0) {
                deliveryMessage.innerHTML = `Agrega ${AppConfig.currency}${needed.toFixed(2)} más para envío gratis`;
            } else {
                deliveryMessage.innerHTML = `Envío: ${AppConfig.currency}${delivery}`;
            }
        }
    }
}

// ===== PRODUCT FUNCTIONS =====
function renderProducts() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    const filteredProducts = filterProducts();

    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="no-products" style="grid-column: 1/-1; text-align:center; padding:4rem 2rem;">
                <i class="fas fa-search"></i>
                <h3>No se encontraron productos</h3>
                <p>Intenta con otros filtros</p>
                <button class="btn-small" onclick="clearFilters()">Limpiar filtros</button>
            </div>
        `;
        updateProductCounts(filteredProducts);
        return;
    }

    const productsHTML = filteredProducts.map(product => {
        const quantity = AppState.productQuantities[product.codigo] || 1;

        return `
            <div class="product-card hover-lift">
                ${product.mas_vendido ? '<span class="product-badge">🔥 Más vendido</span>' : ''}
                ${product.oferta ? '<span class="product-badge" style="background:var(--neon-green);">💥 Oferta</span>' : ''}
                ${product.nuevo ? '<span class="product-badge" style="background:var(--neon-yellow);color:#000;">🆕 Nuevo</span>' : ''}

                <img src="${product.imagen || 'images/products/placeholder.png'}"
                     alt="${product.nombre}"
                     class="product-image"
                     onerror="this.src='images/products/placeholder.png'">

                <div class="product-info">
                    <h3 class="product-title">${product.nombre}</h3>
                    <div class="product-category">${product.categoria || 'General'}</div>
                    <div class="product-price">${AppConfig.currency}${product.precio}</div>

                    <div class="product-actions">
                        <div class="product-quantity">
                            <button class="qty-control minus" onclick="decreaseProductQty('${product.codigo}')">-</button>
                            <span class="qty-display" id="qty-${product.codigo}">${quantity}</span>
                            <button class="qty-control plus" onclick="increaseProductQty('${product.codigo}')">+</button>
                        </div>
                        <button class="btn-add-cart" onclick="addProductToCart('${product.codigo}')">
                            <i class="fas fa-cart-plus"></i> Agregar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = productsHTML;
    updateProductCounts(filteredProducts);
}

function filterProducts() {
    let filtered = [...AppState.products];

    // Filter by category
    if (AppState.filters.category) {
        filtered = filtered.filter(p =>
            p.categoria && p.categoria.toLowerCase() === AppState.filters.category.toLowerCase()
        );
    }

    // Filter by search term
    if (AppState.filters.search) {
        const searchTerm = AppState.filters.search.toLowerCase();
        filtered = filtered.filter(p =>
            p.nombre.toLowerCase().includes(searchTerm) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm))
        );
    }

    // Filter by price range
    filtered = filtered.filter(p =>
        p.precio >= AppState.filters.priceRange[0] &&
        p.precio <= AppState.filters.priceRange[1]
    );

    // Sort products
    if (AppState.filters.sort) {
        switch (AppState.filters.sort) {
            case 'price-asc':
                filtered.sort((a, b) => a.precio - b.precio);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.precio - a.precio);
                break;
            case 'name-asc':
                filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            case 'name-desc':
                filtered.sort((a, b) => b.nombre.localeCompare(a.nombre));
                break;
            case 'popular':
                filtered.sort((a, b) => (b.mas_vendido ? 1 : 0) - (a.mas_vendido ? 1 : 0));
                break;
        }
    }

    return filtered;
}

function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;

    if (AppState.showAllProducts) {
        container.innerHTML = '';
        return;
    }

    const filteredProducts = filterProducts();
    const totalPages = Math.ceil(filteredProducts.length / AppState.itemsPerPage);

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Previous button
    if (AppState.currentPage > 1) {
        paginationHTML += `
            <button class="page-btn" data-page="${AppState.currentPage - 1}">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= AppState.currentPage - 1 && i <= AppState.currentPage + 1)) {
            paginationHTML += `
                <button class="page-btn ${i === AppState.currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        } else if (i === AppState.currentPage - 2 || i === AppState.currentPage + 2) {
            paginationHTML += `<span class="page-dots">...</span>`;
        }
    }

    // Next button
    if (AppState.currentPage < totalPages) {
        paginationHTML += `
            <button class="page-btn" data-page="${AppState.currentPage + 1}">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }

    container.innerHTML = paginationHTML;
}

// ===== CATEGORY FUNCTIONS =====
function renderCategories() {
    const container = document.getElementById('category-filter');
    if (!container) return;

    const categoriesHTML = `
        <option value="">Todas las categorías</option>
        ${AppState.categories.map(cat => `
            <option value="${cat.nombre}" ${AppState.filters.category === cat.nombre ? 'selected' : ''}>
                ${cat.nombre} (${cat.count})
            </option>
        `).join('')}
    `;

    container.innerHTML = categoriesHTML;
}

function renderCategoryCards() {
    const container = document.querySelector('.categories-grid');
    if (!container) return;

    const categoriesHTML = AppState.categories.map(cat => `
        <div class="category-card" onclick="filterByCategory('${cat.nombre}')">
            <div class="category-icon">
                ${getCategoryIcon(cat.nombre)}
            </div>
            <h3 class="category-title">${cat.nombre}</h3>
            <p class="category-desc">${cat.count} productos</p>
            <button class="btn-small">Ver productos</button>
        </div>
    `).join('');

    container.innerHTML = categoriesHTML;
}

function getCategoryIcon(category) {
    const icons = {
        'BEBIDAS ALCOHOLICAS': '<i class="fas fa-beer"></i>',
        'BEBIDAS SIN ALCOHOL': '<i class="fas fa-wine-bottle"></i>',
        'SNACKS/DULCES': '<i class="fas fa-cookie-bite"></i>',
        'TABACO': '<i class="fas fa-smoking"></i>',
        'ALMACEN': '<i class="fas fa-shopping-basket"></i>',
        'FRUTAS/VERDURAS': '<i class="fas fa-apple-alt"></i>'
    };

    for (const [key, icon] of Object.entries(icons)) {
        if (category.includes(key)) return icon;
    }

    return '<i class="fas fa-box"></i>';
}

// ===== FILTER HANDLERS =====
function handleSearch(e) {
    AppState.filters.search = e.target.value;
    AppState.currentPage = 1;
    renderProducts();
    renderPagination();
}

function handleCategoryFilter(e) {
    AppState.filters.category = e.target.value;
    AppState.currentPage = 1;
    renderProducts();
    renderPagination();
}

function handleSortFilter(e) {
    AppState.filters.sort = e.target.value;
    AppState.currentPage = 1;
    renderProducts();
    renderPagination();
}

function handlePriceFilter(e) {
    const value = parseInt(e.target.value);
    AppState.filters.priceRange[1] = value;
    AppState.currentPage = 1;
    renderProducts();
    renderPagination();
}

function handlePageChange(page) {
    AppState.currentPage = page;
    renderProducts();
    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearFilters() {
    AppState.filters = {
        category: '',
        search: '',
        sort: '',
        priceRange: [0, 10000]
    };

    // Reset filter inputs
    if (DOM.searchInput) DOM.searchInput.value = '';
    if (DOM.categoryFilter) DOM.categoryFilter.value = '';
    if (DOM.sortFilter) DOM.sortFilter.value = '';
    if (DOM.priceFilter) DOM.priceFilter.value = 10000;

    // Update price display
    const priceValue = document.getElementById('price-value');
    if (priceValue) priceValue.textContent = '$0 - $10000';

    AppState.currentPage = 1;
    renderProducts();
    renderPagination();
    renderCategories();
}

function filterByCategory(category) {
    AppState.filters.category = category;
    window.location.href = `products.html?category=${encodeURIComponent(category)}`;
}

// ===== PRODUCT QUANTITY FUNCTIONS =====
function increaseProductQty(productCode) {
    if (!AppState.productQuantities[productCode]) {
        AppState.productQuantities[productCode] = 1;
    }
    AppState.productQuantities[productCode]++;
    updateProductQtyDisplay(productCode);
}

function decreaseProductQty(productCode) {
    if (!AppState.productQuantities[productCode] || AppState.productQuantities[productCode] <= 1) {
        AppState.productQuantities[productCode] = 1;
    } else {
        AppState.productQuantities[productCode]--;
    }
    updateProductQtyDisplay(productCode);
}

function updateProductQtyDisplay(productCode) {
    const display = document.getElementById(`qty-${productCode}`);
    if (display) {
        display.textContent = AppState.productQuantities[productCode] || 1;
    }
}

function addProductToCart(productCode) {
    const product = AppState.products.find(p => p.codigo === productCode);
    if (product) {
        const quantity = AppState.productQuantities[productCode] || 1;
        addToCart(product, quantity);
        AppState.productQuantities[productCode] = 1;
        updateProductQtyDisplay(productCode);
    }
}

// ===== CART TOGGLE =====
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');

    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }
}

// ===== MOBILE MENU =====
function initMobileMenu() {
    if (window.innerWidth <= 768) {
        toggleMobileMenu(false);
    }
}

function toggleMobileMenu(show = null) {
    if (!DOM.mainNav) return;

    if (show === null) {
        DOM.mainNav.classList.toggle('active');
    } else {
        DOM.mainNav.classList.toggle('active', show);
    }

    if (DOM.menuToggle) {
        DOM.menuToggle.innerHTML = DOM.mainNav.classList.contains('active')
            ? '<i class="fas fa-times"></i>'
            : '<i class="fas fa-bars"></i>';
    }
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    const color = type === 'success' ? '#00ff00' : '#ff4444';

    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;

    // Add to DOM
    document.body.appendChild(notification);

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #00ff00, #00cc00)' : 'linear-gradient(135deg, #ff4444, #cc0000)'};
        color: #000;
        padding: 15px 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        z-index: 3000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
        max-width: 400px;
        font-weight: 500;
    `;

    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
    `;

    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: #000;
        font-size: 1.5rem;
        cursor: pointer;
        line-height: 1;
    `;

    // Add keyframes for animation
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    // Close button event
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatCurrency(amount) {
    return `${AppConfig.currency}${amount.toFixed(2)}`;
}

function updateUserUI() {
    const loginBtn = document.querySelector('.btn-login');
    const userMenu = document.querySelector('.user-menu');

    if (AppState.user && loginBtn) {
        loginBtn.innerHTML = `<i class="fas fa-user"></i> ${AppState.user.nombre}`;
        loginBtn.href = 'dashboard.html';
    }
}

function updateProductCounts(filteredProducts = null) {
    const filtered = filteredProducts || filterProducts();
    const shown = filtered.length;
    const total = AppState.products.length;

    const shownCount = document.getElementById('shown-count');
    const totalCount = document.getElementById('total-count');

    if (shownCount) shownCount.textContent = shown;
    if (totalCount) totalCount.textContent = total;

    // Show/hide no products message
    const noProducts = document.getElementById('no-products');
    if (noProducts) {
        noProducts.style.display = shown === 0 ? 'block' : 'none';
    }

    // Show/hide products grid
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        productsGrid.style.display = shown === 0 ? 'none' : 'grid';
    }
}

// ===== CHECKOUT FUNCTIONS (if on checkout page) =====
function renderCheckoutItems() {
    const container = document.getElementById('checkout-items');
    if (!container) return;

    if (AppState.cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
                <a href="products.html" class="btn-small">Ver productos</a>
            </div>
        `;
        return;
    }

    container.innerHTML = AppState.cart.map(item => `
        <div class="checkout-item">
            <img src="${item.imagen || 'images/products/placeholder.png'}"
                 alt="${item.nombre}"
                 class="checkout-item-img">
            <div class="checkout-item-info">
                <div class="checkout-item-name">${item.nombre}</div>
                <div class="checkout-item-qty">${item.quantity} x ${AppConfig.currency}${item.precio}</div>
            </div>
            <div class="checkout-item-total">${AppConfig.currency}${(item.quantity * item.precio).toFixed(2)}</div>
        </div>
    `).join('');
}

function updateCheckoutSummary() {
    const subtotalEl = document.getElementById('checkout-subtotal');
    const deliveryEl = document.getElementById('checkout-delivery');
    const totalEl = document.getElementById('checkout-total');

    if (!subtotalEl || !deliveryEl || !totalEl) return;

    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    const delivery = subtotal >= AppConfig.freeDeliveryThreshold ? 0 : AppConfig.deliveryCost;
    const total = subtotal + delivery;

    subtotalEl.textContent = `${AppConfig.currency}${subtotal.toFixed(2)}`;
    deliveryEl.textContent = `${AppConfig.currency}${delivery.toFixed(2)}`;
    totalEl.textContent = `${AppConfig.currency}${total.toFixed(2)}`;
}

// ===== WINDOW EVENT LISTENERS =====
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && DOM.mainNav && DOM.mainNav.classList.contains('active')) {
        toggleMobileMenu(false);
    }
});

// ===== GLOBAL FUNCTIONS =====
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartItem = updateCartItem;
window.updateCartItemQty = updateCartItemQty;
window.clearCart = clearCart;
window.toggleCart = toggleCart;
window.increaseProductQty = increaseProductQty;
window.decreaseProductQty = decreaseProductQty;
window.addProductToCart = addProductToCart;
window.filterByCategory = filterByCategory;
window.clearFilters = clearFilters;
window.getCategoryIcon = getCategoryIcon;

// ===== AUDIO PLAYER =====
function initAudioPlayer() {
    const audio = document.getElementById('bg-music');
    const playBtn = document.getElementById('play-btn');
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');

    if (!audio || !playBtn) return;

    // Try to autoplay
    audio.volume = 0.3; // Default volume
    volumeSlider.value = 0.3;

    const playAudio = () => {
        audio.play().catch(e => {
            console.log("Autoplay prevented:", e);
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        });
    };

    // Play/Pause button
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            playBtn.title = 'Pausar';
        } else {
            audio.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            playBtn.title = 'Reproducir';
        }
    });

    // Mute button
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            audio.muted = !audio.muted;
            muteBtn.innerHTML = audio.muted
                ? '<i class="fas fa-volume-mute"></i>'
                : '<i class="fas fa-volume-up"></i>';
            muteBtn.title = audio.muted ? 'Activar sonido' : 'Silenciar';
        });
    }

    // Volume slider
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value;
            audio.muted = false;
            if (muteBtn) {
                muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                muteBtn.title = 'Silenciar';
            }
        });
    }

    // Update button states based on audio state
    audio.addEventListener('play', () => {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playBtn.title = 'Pausar';
    });

    audio.addEventListener('pause', () => {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.title = 'Reproducir';
    });

    // Try to autoplay with user interaction
    document.addEventListener('click', () => {
        if (audio.paused) {
            playAudio();
        }
    }, { once: true });

    // Also try on page load
    window.addEventListener('load', () => {
        setTimeout(playAudio, 1000);
    });
}

// Initialize audio player when DOM is ready
document.addEventListener('DOMContentLoaded', initAudioPlayer);
