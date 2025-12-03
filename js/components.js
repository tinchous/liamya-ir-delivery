class ComponentLoader {
  static loadComponents() {
    this.initCart();
    this.loadHeaderFooter();
  }

  static loadHeaderFooter() {
    fetch('header.html').then(r => r.text()).then(html => document.getElementById('header-container').innerHTML = html);
    fetch('footer.html').then(r => r.text()).then(html => document.getElementById('footer-container').innerHTML = html);
  }

  static initCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    const floating = document.getElementById('cart-floating');
    const close = document.getElementById('cart-close');

    if (!sidebar || !floating) return;

    const toggleCart = () => {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
    };

    floating.onclick = toggleCart;
    overlay.onclick = toggleCart;
    if (close) close.onclick = toggleCart;

    cartSystem.subscribe((items) => {
      document.getElementById('cart-floating-count').textContent = items.reduce((s,i) => s + i.quantity, 0);
      document.getElementById('cart-total').textContent = '$' + cartSystem.getTotals().total.toFixed(0);
      document.getElementById('cart-items').innerHTML = items.length === 0 ? '<p>Carrito vacío</p>' : items.map(i => `<div><strong>${i.quantity}x ${i.nombre}</strong> - $${i.precio * i.quantity}</div>`).join('');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => ComponentLoader.loadComponents());
