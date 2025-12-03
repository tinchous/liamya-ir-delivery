// ===== CART SYSTEM ENHANCEMENTS =====
class CartSystem {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('autoservice_cart')) || [];
        this.subscribers = [];
        this.deliveryCost = 50;
        this.freeDeliveryThreshold = 1500;
    }

    // Subscribe to cart changes
    subscribe(callback) {
        this.subscribers.push(callback);
        callback(this.items);
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }

    // Notify subscribers
    notify() {
        this.subscribers.forEach(callback => callback(this.items));
    }

    // Add item to cart
    add(product, quantity = 1) {
        const existingIndex = this.items.findIndex(item => item.codigo === product.codigo);

        if (existingIndex > -1) {
            this.items[existingIndex].quantity += quantity;
        } else {
            this.items.push({
                ...product,
                quantity: quantity
            });
        }

        this.save();
        this.notify();
        return this.items;
    }

    // Remove item from cart
    remove(productCode) {
        this.items = this.items.filter(item => item.codigo !== productCode);
        this.save();
        this.notify();
        return this.items;
    }

    // Update item quantity
    update(productCode, quantity) {
        const itemIndex = this.items.findIndex(item => item.codigo === productCode);

        if (itemIndex > -1) {
            if (quantity <= 0) {
                return this.remove(productCode);
            } else {
                this.items[itemIndex].quantity = quantity;
                this.save();
                this.notify();
            }
        }

        return this.items;
    }

    // Clear cart
    clear() {
        this.items = [];
        this.save();
        this.notify();
        return this.items;
    }

    // Save cart to localStorage
    save() {
        localStorage.setItem('autoservice_cart', JSON.stringify(this.items));
    }

    // Get cart totals
    getTotals() {
        const subtotal = this.items.reduce((total, item) =>
            total + (item.precio * item.quantity), 0);

        const delivery = subtotal >= this.freeDeliveryThreshold ? 0 : this.deliveryCost;
        const total = subtotal + delivery;

        return {
            subtotal,
            delivery,
            total,
            itemCount: this.items.reduce((count, item) => count + item.quantity, 0)
        };
    }

    // Check if cart is empty
    isEmpty() {
        return this.items.length === 0;
    }

    // Get item count
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    // Get item by product code
    getItem(productCode) {
        return this.items.find(item => item.codigo === productCode);
    }

    // Export cart for checkout
    exportForCheckout() {
        return {
            items: this.items,
            totals: this.getTotals(),
            timestamp: new Date().toISOString()
        };
    }

    // Import cart from checkout
    importFromCheckout(checkoutData) {
        this.items = checkoutData.items || [];
        this.save();
        this.notify();
    }
}

// Initialize cart system
const cartSystem = new CartSystem();

// ===== CHECKOUT FUNCTIONS =====
function processCheckout(orderData) {
    return new Promise((resolve, reject) => {
        try {
            // Validate order data
            if (!orderData.customer || !orderData.customer.name || !orderData.customer.phone) {
                throw new Error('Información del cliente incompleta');
            }

            if (cartSystem.isEmpty()) {
                throw new Error('El carrito está vacío');
            }

            // Create order object
            const order = {
                id: generateOrderId(),
                ...orderData,
                cart: cartSystem.exportForCheckout(),
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            // Save order to localStorage
            const orders = JSON.parse(localStorage.getItem('autoservice_orders')) || [];
            orders.push(order);
            localStorage.setItem('autoservice_orders', JSON.stringify(orders));

            // Clear cart after successful order
            cartSystem.clear();

            // Send to WhatsApp
            sendToWhatsApp(order);

            resolve(order);
        } catch (error) {
            reject(error);
        }
    });
}

function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
}

function sendToWhatsApp(order) {
    const { customer, cart } = order;
    const { totals } = cart;

    // Format items for WhatsApp
    const itemsText = cart.items.map(item =>
        `• ${item.quantity}x ${item.nombre} - $${item.precio * item.quantity}`
    ).join('\n');

    // Create message
    const message = `*NUEVO PEDIDO - Autoservice Liam Yahir*

📋 *Orden:* ${order.id}
🕐 *Fecha:* ${new Date(order.createdAt).toLocaleString('es-UY')}

👤 *Cliente:*
• Nombre: ${customer.name}
• Teléfono: ${customer.phone}
• Email: ${customer.email || 'No especificado'}

📍 *Dirección de entrega:*
${customer.address}

📝 *Notas:*
${customer.notes || 'Sin notas específicas'}

🛒 *Productos:*
${itemsText}

💰 *Total:*
• Subtotal: $${totals.subtotal}
• Delivery: $${totals.delivery}
• *TOTAL: $${totals.total}*

💳 *Método de pago:* ${customer.paymentMethod}

⏰ *Horario de entrega:* ${customer.deliveryTime || 'Lo antes posible'}`;

    // Encode for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = '59892308828'; // Número del autoservice

    // Open WhatsApp
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
}

// ===== LOCAL STORAGE MANAGEMENT =====
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

// ===== ORDER HISTORY =====
function getOrderHistory() {
    return loadFromLocalStorage('autoservice_orders') || [];
}

function getOrderById(orderId) {
    const orders = getOrderHistory();
    return orders.find(order => order.id === orderId);
}

function updateOrderStatus(orderId, status) {
    const orders = getOrderHistory();
    const orderIndex = orders.findIndex(order => order.id === orderId);

    if (orderIndex > -1) {
        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();
        saveToLocalStorage('autoservice_orders', orders);
        return true;
    }

    return false;
}

// ===== CART PERSISTENCE =====
function backupCart() {
    const cartData = cartSystem.exportForCheckout();
    saveToLocalStorage('autoservice_cart_backup', cartData);
}

function restoreCart() {
    const backup = loadFromLocalStorage('autoservice_cart_backup');
    if (backup) {
        cartSystem.importFromCheckout(backup);
        return true;
    }
    return false;
}

// ===== EXPORT FOR GLOBAL USE =====
window.cartSystem = cartSystem;
window.processCheckout = processCheckout;
window.getOrderHistory = getOrderHistory;
window.getOrderById = getOrderById;
