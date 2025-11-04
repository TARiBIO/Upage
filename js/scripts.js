document.addEventListener('DOMContentLoaded', () => {
  initHeaderShrink();
  initCart();
  initProductActions();
});

/* ===========================
   HEADER SHRINK ON SCROLL
=========================== */
function initHeaderShrink() {
  const header = document.getElementById('site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('shrink', window.scrollY > 10);
  });
}

/* ===========================
   CART SYSTEM
=========================== */
function initCart() {
  const cartBtn = document.getElementById('cartBtn');
  const cartPanel = document.getElementById('cartPanel');
  const cartList = document.getElementById('cartList');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartCount = document.getElementById('cartCount');
  const overlay = document.getElementById('cartOverlay');
  const closeCartBtn = document.querySelector('.close-cart');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const clearCartBtn = document.getElementById('clearCartBtn');

  let cart = JSON.parse(localStorage.getItem('ut_cart') || '[]');

  function formatMoney(n) {
    return '$' + parseFloat(n).toFixed(2);
  }

  function saveCart() {
    localStorage.setItem('ut_cart', JSON.stringify(cart));
  }

  function renderCart() {
    if (!cartList || !cartSubtotal || !cartCount) return;
    cartList.innerHTML = '';

    if (cart.length === 0) {
      cartList.innerHTML = '<div class="empty">Your bag is empty.</div>';
      cartSubtotal.textContent = '$0.00';
      cartCount.textContent = '0';
      return;
    }

    let total = 0;
    cart.forEach((item, idx) => {
      total += item.price * item.qty;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div style="flex:1">
          <div style="font-weight:600">${item.name}</div>
          <div style="color:var(--muted);font-size:13px">${formatMoney(item.price)} × ${item.qty}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
          <button class="decrease" data-idx="${idx}">-</button>
          <button class="remove" data-idx="${idx}">Remove</button>
        </div>
      `;
      cartList.appendChild(div);
    });

    cartSubtotal.textContent = formatMoney(total);
    cartCount.textContent = cart.reduce((sum, i) => sum + i.qty, 0);

    // Bind remove/decrease buttons
    cartList.querySelectorAll('.decrease').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.idx);
        if (cart[i]) {
          cart[i].qty -= 1;
          if (cart[i].qty <= 0) cart.splice(i, 1);
          saveCart();
          renderCart();
        }
      });
    });
    cartList.querySelectorAll('.remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.idx);
        if (cart[i]) {
          cart.splice(i, 1);
          saveCart();
          renderCart();
        }
      });
    });
  }

  function openCart() {
    if (!cartPanel || !overlay) return;
    cartPanel.classList.add('open');
    overlay.classList.add('active');
  }

  function closeCart() {
    if (!cartPanel || !overlay) return;
    cartPanel.classList.remove('open');
    overlay.classList.remove('active');
  }

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (overlay) overlay.addEventListener('click', closeCart);

  if (clearCartBtn) clearCartBtn.addEventListener('click', () => {
    cart = [];
    saveCart();
    renderCart();
  });

  if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return alert('Your bag is empty.');
    alert('Checkout demo — cart cleared.');
    cart = [];
    saveCart();
    renderCart();
    closeCart();
  });

  renderCart();

  // Return cart object for product actions
  return { cart, saveCart, renderCart, openCart };
}

/* ===========================
   ADD TO CART BUTTONS
=========================== */
function initProductActions() {
  const cartSystem = initCart(); // get cart functions
  const cart = cartSystem.cart;
  const saveCart = cartSystem.saveCart;
  const renderCart = cartSystem.renderCart;
  const openCart = cartSystem.openCart;

  document.querySelectorAll('.addCartBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      const id = card.dataset.id || '';
      const name = card.dataset.name || 'Unnamed Product';
      const price = parseFloat(card.dataset.price || '0');
      const img = card.dataset.img || '';

      const existing = cart.find(i => i.id === id);
      if (existing) existing.qty += 1;
      else cart.push({ id, name, price, qty: 1, image: img });

      saveCart();
      renderCart();
      openCart();

      // optional toast
      const toast = document.createElement('div');
      toast.textContent = `${name} added to cart`;
      toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:8px 12px;border-radius:6px;z-index:9999;font-family:inherit;';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1200);
    });
  });
}