// js/ui.js
import * as Order from './order.js';

/**
 * Render menu items to grid
 * @param {Array} menuData - Array of menu items
 */
export function renderMenu(menuData) {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  menuData.forEach(item => {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
      <img src="${item.gambar}" alt="${item.nama}" style="max-width:100%; height:120px; object-fit:cover; border-radius:10px;">
      <h4>${item.nama}</h4>
      <p>Rp${item.harga.toLocaleString()}</p>
    `;
    
    // PENTING: Tambahkan onclick untuk add item ke cart
    div.onclick = () => {
      if (window.addMenuToCart) {
        window.addMenuToCart(item);
      }
    };
    
    grid.appendChild(div);
  });
}

/**
 * Render order list and total
 */
export function renderOrder() {
  const orderList = document.getElementById('orderList');
  const totalDisplay = document.getElementById('total');
  
  if (!orderList || !totalDisplay) return;
  
  const items = Order.getItems();
  const total = Order.getTotal();
  
  orderList.innerHTML = '';
  
  if (items.length === 0) {
    orderList.innerHTML = '<li style="text-align:center; color:#999;">Belum ada pesanan</li>';
  } else {
    items.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${item.nama} x${item.jumlah}</span>
        <span style="font-weight:700;">Rp${(item.harga * item.jumlah).toLocaleString()}</span>
      `;
      orderList.appendChild(li);
    });
  }
  
  totalDisplay.textContent = total.toLocaleString();
}

/**
 * Show QRIS modal for payment
 * @param {Number} total - Total amount
 * @param {Object} pembayaranData - Payment data object
 */
export function showQrisModal(total, pembayaranData) {
  const qrisTotal = document.getElementById('qrisTotal');
  if (qrisTotal) {
    qrisTotal.textContent = total.toLocaleString();
  }
  
  // Show modal using Bootstrap
  const modalEl = document.getElementById('qrisModal');
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    
    // Handle "Bayar Sekarang" button
    const btnBayar = document.getElementById('btnBayarSekarang');
    if (btnBayar) {
      btnBayar.onclick = () => {
        // Close modal
        modal.hide();
        
        // Show struk after payment
        showStruk(pembayaranData);
        
        // Clear order
        Order.clearOrder();
        renderOrder();
        
        // Play success sound
        const successSound = document.getElementById('successSound');
        if (successSound) {
          successSound.play().catch(() => {});
        }
      };
    }
  }
}

/**
 * Show receipt popup
 * @param {Object} data - Payment data
 */
export function showStruk(data) {
  const waktuFormatted = new Date(data.waktu).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const itemsHTML = data.items.map(it => `
    <div class="struk-item">
      <span>${it.nama} x${it.jumlah}</span>
      <span>Rp${it.subtotal.toLocaleString()}</span>
    </div>
  `).join('');

  const strukHTML = `
    <p><strong>Nama Pemesan:</strong> <span>${escapeHtml(data.nama_pemesan)}</span></p>
    <p><strong>Waktu Pesanan:</strong> <span>${waktuFormatted}</span></p>
    <p><strong>Metode Pembayaran:</strong> <span>${escapeHtml(data.metode)}</span></p>
    <p><strong>Pengantaran:</strong> <span>${escapeHtml(data.opsiAntar)}</span></p>
    ${data.opsiAntar === 'Antar ke Rumah' ? `<p><strong>Alamat:</strong> <span>${escapeHtml(data.alamat)}</span></p>` : ''}
    
    <hr>
    
    <div class="struk-items">
      <p><strong>Detail Pesanan:</strong></p>
      ${itemsHTML}
    </div>
    
    <hr>
    
    <p style="font-size:1.2em;"><strong>Total Pesanan:</strong> <span style="color:#f5576c;">Rp ${data.total.toLocaleString()}</span></p>
    
    ${data.metode === 'Tunai' ? `
      <p><strong>Uang Dibayar:</strong> <span>Rp ${data.uang.toLocaleString()}</span></p>
      <p><strong>Kembalian:</strong> <span style="color:#4caf50; font-weight:700;">Rp ${data.kembalian.toLocaleString()}</span></p>
    ` : `
      <p style="background:#e3f2fd; padding:10px; border-radius:8px; text-align:center; margin-top:10px;">
        <strong>✅ Pembayaran berhasil melalui ${data.metode}</strong><br>
        <small style="color:#666;">Total: Rp ${data.total.toLocaleString()}</small>
      </p>
    `}
  `;

  const strukDetail = document.getElementById('strukDetail');
  if (strukDetail) {
    strukDetail.innerHTML = strukHTML;
  }
  
  const popup = document.getElementById('popupStruk');
  if (popup) {
    popup.style.display = 'flex';
    popup.setAttribute('aria-hidden', 'false');
  }
}

/**
 * Filter menu by category
 * @param {String} kategori - Category name
 * @param {Array} allMenu - All menu items
 */
export function filterMenuByCategory(kategori, allMenu) {
  if (kategori === 'all') {
    renderMenu(allMenu);
  } else {
    const filtered = allMenu.filter(m => m.kategori === kategori);
    renderMenu(filtered);
  }
}

/**
 * Escape HTML to prevent XSS
 * @param {String} str - String to escape
 * @returns {String}
 */
function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
