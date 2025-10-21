// data menu
const menu = [
  { nama: 'Burger', harga: 25000, kategori: 'makanan', gambar: 'burger.jpg' },
  { nama: 'Kentang Goreng', harga: 15000, kategori: 'makanan', gambar: 'kentang.jpg' },
  { nama: 'Cola', harga: 10000, kategori: 'minuman', gambar: 'cola.jpg' },
  { nama: 'Es Krim Sundae', harga: 12000, kategori: 'dessert', gambar: 'eskrim.jpg' },
  { nama: 'Ayam Goreng', harga: 25000, kategori: 'makanan', gambar: 'ayam.jpg' },
  { nama: 'Lemonade', harga: 8000, kategori: 'minuman', gambar: 'lemonade.jpg' },
  { nama: 'Puding Coklat', harga: 9000, kategori: 'dessert', gambar: 'puding.jpg' },
  { nama: 'Nasi Goreng', harga: 20000, kategori: 'makanan', gambar: 'nasigoreng.jpg' },
  { nama: 'Teh Manis', harga: 7000, kategori: 'minuman', gambar: 'tehmanis.jpg' },
  { nama: 'Kue Lapis', harga: 11000, kategori: 'dessert', gambar: 'kuelapis.jpg' }
];

let total = 0;
let pesanan = [];

// elemen DOM
const orderList = document.getElementById('orderList');
const totalDisplay = document.getElementById('total');
const klikSound = document.getElementById('klikSound');
const successSound = document.getElementById('successSound');
const resetSound = document.getElementById('resetSound');

// tampilkan menu ke grid
function tampilkanMenu(data) {
  const grid = document.getElementById('menuGrid');
  grid.innerHTML = '';
  data.forEach(item => {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
      <img src="${item.gambar}" alt="${item.nama}">
      <h4>${item.nama}</h4>
      <p>Rp${item.harga.toLocaleString()}</p>
    `;
    // ketika diklik, tambahkan pesanan
    div.addEventListener('click', () => tambahPesanan(item));
    grid.appendChild(div);
  });
}
tampilkanMenu(menu);

// filter menu (mengaktifkan tombol yang sesuai tanpa mengandalkan event global)
function filterMenu(kategori) {
  // hapus semua active
  const buttons = Array.from(document.querySelectorAll('.kategori button'));
  buttons.forEach(btn => btn.classList.remove('active'));

  // cari tombol yang punya onclick berisi kategori itu (safe)
  const btnToActivate = buttons.find(btn => {
    const onclickAttr = btn.getAttribute('onclick') || '';
    // cek format 'filterMenu('kategori')' (memastikan ada tanda kutip)
    return onclickAttr.includes(`'${kategori}'`) || onclickAttr.includes(`"${kategori}"`);
  });
  if (btnToActivate) btnToActivate.classList.add('active');

  if (kategori === 'all') tampilkanMenu(menu);
  else tampilkanMenu(menu.filter(m => m.kategori === kategori));
}

// tambahkan item ke pesanan
function tambahPesanan(item) {
  // mainkan suara klik jika ada
  try { klikSound && klikSound.play(); } catch(e) {}

  const existing = pesanan.find(p => p.nama === item.nama);
  if (existing) {
    existing.jumlah++;
  } else {
    pesanan.push({ ...item, jumlah: 1 });
  }
  renderPesanan();
}

// render pesanan & hitung total
function renderPesanan() {
  orderList.innerHTML = '';
  total = 0;
  pesanan.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${p.nama} x${p.jumlah} 
      <span style="float:right;"><b>Rp${(p.harga * p.jumlah).toLocaleString()}</b></span>
    `;
    orderList.appendChild(li);
    total += p.harga * p.jumlah;
  });
  totalDisplay.textContent = total.toLocaleString();
}

// toggle input alamat ketika pilih antar
function toggleAlamat() {
  const opsi = document.getElementById("opsiPengantaran").value;
  const alamatSection = document.getElementById("alamatSection");
  alamatSection.style.display = (opsi === "Antar ke Rumah") ? "block" : "none";
}

// fungsi bayar — satu versi yang lengkap, menampilkan struk popup
function bayar() {
  const totalNumber = total; // sudah dihitung di renderPesanan
  const uang = parseInt(document.getElementById('uangBayar').value);
  const metode = document.getElementById('metodePembayaran').value;
  const opsiAntar = document.getElementById('opsiPengantaran').value;
  const alamat = (document.getElementById('alamatPengantaran') || {}).value || '';
  const kembalianEl = document.getElementById('kembalian');

  // validasi
  if (!opsiAntar) {
    alert("🚚 Silakan pilih opsi pengantaran terlebih dahulu!");
    return;
  }
  if (opsiAntar === "Antar ke Rumah" && alamat.trim() === "") {
    alert("🏠 Masukkan alamat pengantaran terlebih dahulu!");
    return;
  }
  if (!metode) {
    alert("💳 Silakan pilih metode pembayaran terlebih dahulu!");
    return;
  }
  if (isNaN(uang) || uang < totalNumber) {
    kembalianEl.textContent = "❌ Uang tidak cukup!";
    kembalianEl.style.color = "red";
    return;
  }

  const kembalian = uang - totalNumber;
  kembalianEl.textContent = `✅ Pembayaran (${metode}) berhasil! Kembalian: Rp${kembalian.toLocaleString()}`;
  kembalianEl.style.color = "green";
  try { successSound && successSound.play(); } catch(e) {}

  // simpan untuk struk
  const pembayaranData = {
    metode,
    total: totalNumber,
    uang,
    kembalian,
    opsiAntar,
    alamat,
    waktu: new Date().toLocaleString(),
    items: pesanan.map(p => ({ nama: p.nama, jumlah: p.jumlah, subtotal: p.harga * p.jumlah }))
  };
  localStorage.setItem("pembayaran", JSON.stringify(pembayaranData));

  // tampilkan struk popup
  tampilkanStruk(pembayaranData);

  // optional: reset pesanan setelah beberapa detik (atau biarkan user tutup struk)
  // resetOrder();
}

// tampilkan struk di popup
function tampilkanStruk(data) {
  const strukItems = data.items.map(it => `<div>${it.nama} x${it.jumlah} <span style="float:right">Rp${it.subtotal.toLocaleString()}</span></div>`).join('');
  const strukHTML = `
    <p><strong>Waktu:</strong> ${data.waktu}</p>
    <p><strong>Metode Pembayaran:</strong> ${data.metode}</p>
    <p><strong>Opsi Pengantaran:</strong> ${data.opsiAntar}</p>
    ${data.opsiAntar === "Antar ke Rumah" ? `<p><strong>Alamat:</strong> ${data.alamat}</p>` : ""}
    <hr>
    ${strukItems}
    <hr>
    <p><strong>Total:</strong> Rp${data.total.toLocaleString()}</p>
    <p><strong>Uang Bayar:</strong> Rp${data.uang.toLocaleString()}</p>
    <p><strong>Kembalian:</strong> Rp${data.kembalian.toLocaleString()}</p>
  `;

  document.getElementById("strukDetail").innerHTML = strukHTML;
  document.getElementById("popupStruk").style.display = "flex";
}

// tutup popup struk
function tutupStruk() {
  document.getElementById("popupStruk").style.display = "none";
}

// cetak struk (buka jendela baru + print)
function cetakStruk() {
  const isiStruk = document.getElementById("strukDetail").innerHTML;
  const jendelaCetak = window.open("", "_blank", "width=400,height=600");
  jendelaCetak.document.write(`
    <html>
      <head>
        <title>Struk Pesanan</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 10px; }
          hr { border: none; border-top: 1px dashed #999; }
        </style>
      </head>
      <body>
        <h2>🧾 McOrder - Struk Pesanan</h2>
        ${isiStruk}
        <p>Terima kasih telah memesan di McOrder 🍔</p>
      </body>
    </html>
  `);
  jendelaCetak.document.close();
  jendelaCetak.focus();
  jendelaCetak.print();
}

// reset pesanan
function resetOrder() {
  try { resetSound && resetSound.play(); } catch(e) {}
  pesanan = [];
  total = 0;
  orderList.innerHTML = '';
  totalDisplay.textContent = '0';
  const uangBayarInput = document.getElementById('uangBayar');
  if (uangBayarInput) uangBayarInput.value = '';
  const kembalianEl = document.getElementById('kembalian');
  if (kembalianEl) kembalianEl.textContent = '';
}
