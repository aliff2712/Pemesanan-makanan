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
const orderList = document.getElementById('orderList');
const totalDisplay = document.getElementById('total');
const klikSound = document.getElementById('klikSound');
const successSound = document.getElementById('successSound');
const resetsound = document.getElementById('resetSound');


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
    div.onclick = () => tambahPesanan(item);
    grid.appendChild(div);
  });
}
tampilkanMenu(menu);

function filterMenu(kategori) {
  document.querySelectorAll('.kategori button').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  if (kategori === 'all') tampilkanMenu(menu);
  else tampilkanMenu(menu.filter(m => m.kategori === kategori));
}

function tambahPesanan(item) {
  klikSound.play();
  const existing = pesanan.find(p => p.nama === item.nama);
  if (existing) {
    existing.jumlah++;
  } else {
    pesanan.push({ ...item, jumlah: 1 });
  }
  renderPesanan();
}

function renderPesanan() {
  orderList.innerHTML = '';
  total = 0;
  pesanan.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `${p.nama} x${p.jumlah} <b>Rp${(p.harga * p.jumlah).toLocaleString()}</b>`;
    orderList.appendChild(li);
    total += p.harga * p.jumlah;
  });
  totalDisplay.textContent = total.toLocaleString();
}

function bayar() {
  const uang = parseInt(document.getElementById('uangBayar').value);
  if (isNaN(uang) || uang < total) {
    alert('Uang tidak cukup!');
    return;
  }
  const kembali = uang - total;
  document.getElementById('kembalian').textContent = `Kembalian: Rp${kembali.toLocaleString()}`;
  successSound.play();
}

function resetOrder() {
  resetsound.play();
  pesanan = [];
  total = 0;
  orderList.innerHTML = '';
  totalDisplay.textContent = '0';
  document.getElementById('uangBayar').value = '';
  document.getElementById('kembalian').textContent = '';
}
