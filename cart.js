/*!
 * ZoonBoard Cart — cart.js
 * Self-contained: injects CSS + drawer HTML, manages localStorage state.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'zb_cart_v1';

  /* ─── STORAGE ──────────────────────────────────────────── */
  function getCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function _save(cart) { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }

  /* ─── PUBLIC API ────────────────────────────────────────── */
  window.getCart = getCart;

  window.cartAddItem = function (id, name, price, image) {
    var cart = getCart();
    var item = cart.find(function (i) { return i.id === id; });
    if (item) { item.qty += 1; }
    else { cart.push({ id: id, name: name, price: +price, image: image, qty: 1 }); }
    _save(cart);
    _badge();
    _open();
  };

  window.cartRemoveItem = function (id) {
    _save(getCart().filter(function (i) { return i.id !== id; }));
    _render(); _badge();
  };

  window.cartUpdateQty = function (id, qty) {
    qty = Math.max(0, parseInt(qty, 10));
    if (qty === 0) { window.cartRemoveItem(id); return; }
    var cart = getCart();
    var item = cart.find(function (i) { return i.id === id; });
    if (item) { item.qty = qty; _save(cart); }
    _render(); _badge();
  };

  window.cartOpen  = function () { _open(); };
  window.cartClose = function () { _close(); };

  /* ─── HELPERS ───────────────────────────────────────────── */
  function _total() {
    return getCart().reduce(function (s, i) { return s + i.price * i.qty; }, 0);
  }
  function _count() {
    return getCart().reduce(function (s, i) { return s + i.qty; }, 0);
  }
  function _fmt(n) { return '$' + (+n).toFixed(0); }

  function _badge() {
    var n = _count();
    document.querySelectorAll('.cart-count').forEach(function (el) { el.textContent = n; });
    var dc = document.getElementById('zb-drawer-count');
    if (dc) dc.textContent = n;
  }

  /* ─── RENDER ────────────────────────────────────────────── */
  function _render() {
    var cart   = getCart();
    var body   = document.getElementById('zb-cart-body');
    var footer = document.getElementById('zb-cart-footer');
    if (!body) return;

    if (cart.length === 0) {
      body.innerHTML =
        '<div class="zb-empty">' +
        '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="color:#d4d4d4"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' +
        '<p class="zb-empty-title">Your cart is empty</p>' +
        '<p class="zb-empty-sub">Find your perfect balance board.</p>' +
        '<a href="products.html" onclick="cartClose()" class="zb-empty-btn">Shop Now</a>' +
        '</div>';
      footer.style.display = 'none';
      return;
    }

    footer.style.display = '';
    body.innerHTML = cart.map(function (item) {
      return (
        '<div class="zb-item">' +
          '<a href="product.html?id=' + item.id + '" onclick="cartClose()" class="zb-item-img">' +
            '<img src="' + item.image + '" alt="' + item.name + '" loading="lazy" />' +
          '</a>' +
          '<div class="zb-item-meta">' +
            '<a href="product.html?id=' + item.id + '" onclick="cartClose()" class="zb-item-name">' + item.name + '</a>' +
            '<div class="zb-item-price">' + _fmt(item.price) + '</div>' +
            '<div class="zb-item-qty-row">' +
              '<button class="zb-qty-btn" onclick="cartUpdateQty(\'' + item.id + '\',' + (item.qty - 1) + ')" aria-label="Decrease">&#8722;</button>' +
              '<span class="zb-qty-val">' + item.qty + '</span>' +
              '<button class="zb-qty-btn" onclick="cartUpdateQty(\'' + item.id + '\',' + (item.qty + 1) + ')" aria-label="Increase">+</button>' +
            '</div>' +
          '</div>' +
          '<div class="zb-item-right">' +
            '<button class="zb-item-remove" onclick="cartRemoveItem(\'' + item.id + '\')" aria-label="Remove">' +
              '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
            '</button>' +
            '<div class="zb-item-subtotal">' + _fmt(item.price * item.qty) + '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    var t = _total();
    document.getElementById('zb-subtotal').textContent = _fmt(t);
    document.getElementById('zb-total').textContent    = _fmt(t);
  }

  /* ─── DRAWER OPEN / CLOSE ───────────────────────────────── */
  function _open() {
    var d = document.getElementById('zb-cart-drawer');
    var o = document.getElementById('zb-cart-overlay');
    if (!d) return;
    d.classList.add('open');
    o.classList.add('open');
    document.body.style.overflow = 'hidden';
    _render();
  }
  function _close() {
    var d = document.getElementById('zb-cart-drawer');
    var o = document.getElementById('zb-cart-overlay');
    if (!d) return;
    d.classList.remove('open');
    o.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ─── INJECT CSS + HTML ─────────────────────────────────── */
  function _inject() {

    /* ── CSS ── */
    if (!document.getElementById('zb-cart-css')) {
      var s = document.createElement('style');
      s.id = 'zb-cart-css';
      s.textContent = [
        /* overlay */
        '.zb-cart-overlay{position:fixed;inset:0;z-index:498;background:rgba(0,0,0,.46);opacity:0;pointer-events:none;transition:opacity .3s}',
        '.zb-cart-overlay.open{opacity:1;pointer-events:auto}',
        /* drawer */
        '.zb-cart-drawer{position:fixed;top:0;right:0;bottom:0;z-index:499;width:min(440px,100vw);background:#fff;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .36s cubic-bezier(.4,0,.2,1);box-shadow:-6px 0 48px rgba(0,0,0,.13)}',
        '.zb-cart-drawer.open{transform:translateX(0)}',
        /* header */
        '.zb-head{display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:64px;flex-shrink:0;border-bottom:1px solid rgba(0,0,0,.08)}',
        '.zb-head-title{font-family:"Barlow Condensed",sans-serif;font-size:20px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#181818;display:flex;align-items:center;gap:10px}',
        '.zb-drawer-count{display:inline-flex;align-items:center;justify-content:center;background:#81a494;color:#fff;font-size:11px;font-weight:700;min-width:20px;height:20px;border-radius:50%;padding:0 4px}',
        '.zb-head-close{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,.1);border-radius:50%;background:none;cursor:pointer;color:#6B6B6B;transition:border-color .2s,color .2s;flex-shrink:0}',
        '.zb-head-close:hover{border-color:#181818;color:#181818}',
        /* body */
        '#zb-cart-body{flex:1;overflow-y:auto;padding:4px 0;scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.1) transparent}',
        /* empty */
        '.zb-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;height:100%;padding:48px 24px;gap:0}',
        '.zb-empty-title{font-family:"Barlow Condensed",sans-serif;font-size:28px;font-weight:800;text-transform:uppercase;color:#181818;margin:16px 0 8px}',
        '.zb-empty-sub{font-size:14px;line-height:1.6;color:#6B6B6B;margin-bottom:28px}',
        '.zb-empty-btn{display:inline-flex;align-items:center;background:#181818;color:#fff;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:13px 32px;border-radius:100px;text-decoration:none;transition:background .2s}',
        '.zb-empty-btn:hover{background:#81a494}',
        /* item */
        '.zb-item{display:flex;align-items:flex-start;gap:14px;padding:16px 24px;border-bottom:1px solid rgba(0,0,0,.06)}',
        '.zb-item-img{width:78px;height:94px;flex-shrink:0;border-radius:10px;overflow:hidden;background:#F9F7F3;display:block}',
        '.zb-item-img img{width:100%;height:100%;object-fit:contain;padding:4px}',
        '.zb-item-meta{flex:1;display:flex;flex-direction:column;gap:4px;min-width:0}',
        '.zb-item-name{font-family:"Barlow Condensed",sans-serif;font-size:18px;font-weight:800;text-transform:uppercase;color:#181818;letter-spacing:.02em;line-height:1.1;display:block;text-decoration:none}',
        '.zb-item-name:hover{color:#81a494}',
        '.zb-item-price{font-size:13px;color:#6B6B6B}',
        '.zb-item-qty-row{display:flex;align-items:center;margin-top:6px;width:fit-content;border:1px solid rgba(0,0,0,.12);border-radius:8px;overflow:hidden}',
        '.zb-qty-btn{width:32px;height:28px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;font-size:17px;color:#181818;line-height:1;transition:background .15s}',
        '.zb-qty-btn:hover{background:rgba(0,0,0,.06)}',
        '.zb-qty-val{font-size:13px;font-weight:600;min-width:28px;text-align:center;color:#181818;border-left:1px solid rgba(0,0,0,.08);border-right:1px solid rgba(0,0,0,.08);height:28px;display:flex;align-items:center;justify-content:center}',
        '.zb-item-right{display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;flex-shrink:0;min-height:94px}',
        '.zb-item-remove{background:none;border:none;cursor:pointer;color:#ccc;padding:4px;transition:color .2s}',
        '.zb-item-remove:hover{color:#181818}',
        '.zb-item-subtotal{font-family:"Barlow Condensed",sans-serif;font-size:18px;font-weight:700;color:#181818}',
        /* footer */
        '#zb-cart-footer{flex-shrink:0;padding:18px 24px 28px;border-top:1px solid rgba(0,0,0,.08);background:#F9F7F3}',
        '.zb-price-row{display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#6B6B6B;margin-bottom:8px}',
        '.zb-price-row-free{color:#4E7A5E;font-weight:600}',
        '.zb-total-row{display:flex;justify-content:space-between;align-items:baseline;padding-top:12px;margin-top:6px;border-top:1px solid rgba(0,0,0,.1);margin-bottom:20px}',
        '.zb-total-lbl{font-family:"Barlow Condensed",sans-serif;font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#181818}',
        '.zb-total-amt{font-family:"Barlow Condensed",sans-serif;font-size:30px;font-weight:800;color:#181818}',
        '.zb-checkout-link{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:16px;background:#181818;color:#fff;font-family:"Barlow Condensed",sans-serif;font-size:18px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;border-radius:100px;text-decoration:none;transition:background .2s,transform .15s}',
        '.zb-checkout-link:hover{background:#4E7A5E}',
        '.zb-checkout-link:active{transform:scale(.98)}',
        '.zb-trust-note{text-align:center;font-size:11px;color:#9B9B9B;margin-top:11px;letter-spacing:.02em;line-height:1.5}'
      ].join('\n');
      document.head.appendChild(s);
    }

    /* ── HTML ── */
    if (!document.getElementById('zb-cart-drawer')) {
      var wrap = document.createElement('div');
      wrap.innerHTML =
        '<div class="zb-cart-overlay" id="zb-cart-overlay"></div>' +
        '<div class="zb-cart-drawer" id="zb-cart-drawer" role="dialog" aria-label="Shopping cart" aria-modal="true">' +
          '<div class="zb-head">' +
            '<div class="zb-head-title">Cart <span class="zb-drawer-count" id="zb-drawer-count">0</span></div>' +
            '<button class="zb-head-close" onclick="cartClose()" aria-label="Close cart">' +
              '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
            '</button>' +
          '</div>' +
          '<div id="zb-cart-body"></div>' +
          '<div id="zb-cart-footer" style="display:none">' +
            '<div class="zb-price-row"><span>Subtotal</span><span id="zb-subtotal">$0</span></div>' +
            '<div class="zb-price-row"><span>Shipping</span><span class="zb-price-row-free">Free</span></div>' +
            '<div class="zb-total-row">' +
              '<span class="zb-total-lbl">Total</span>' +
              '<span class="zb-total-amt" id="zb-total">$0</span>' +
            '</div>' +
            '<a href="checkout.html" onclick="cartClose()" class="zb-checkout-link">' +
              'Checkout' +
              '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 3l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</a>' +
            '<p class="zb-trust-note">&#128274; Secure checkout &nbsp;&middot;&nbsp; Free shipping &nbsp;&middot;&nbsp; 30-day returns</p>' +
          '</div>' +
        '</div>';
      document.body.appendChild(wrap);

      document.getElementById('zb-cart-overlay').addEventListener('click', _close);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          var d = document.getElementById('zb-cart-drawer');
          if (d && d.classList.contains('open')) _close();
        }
      });
    }

    /* wire cart buttons */
    document.querySelectorAll('.cart-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) { e.preventDefault(); _open(); });
    });

    _badge();
  }

  /* ── BOOT ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _inject);
  } else {
    _inject();
  }

})();
