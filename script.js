// ====== KONFIGURASI (ganti sesuai data client) ======
const WA_NUMBER = '6285606685163';            // TODO: nomor WA resmi client (format 62xxx)
const API_URL = '';                            // mis. 'http://localhost:8000/api/orders' (endpoint Laravel)
// Data dummy dari situs lama. TODO: harga & varian final dari client
const MENU = {
  cookie: [
    {n:'Scarlett Velvet',d:'Red velvet dengan white choco drizzle dan isian cream cheese.',p:5000,c:'#B3202F'},
    {n:'Blue Dive',d:'Blue velvet dengan potongan Oreo crumble. Renyah di luar, lembut di dalam.',p:5000,c:'#6C8FD6'},
    {n:'Cinnamon Be',d:'Cookie kayu manis hangat dengan crumble biscoff.',p:5000,c:'#B9763B'},
    {n:'Bite Me Choco',d:'Adonan cokelat dengan choco ceres. Pekat dan chewy.',p:5000,c:'#4A2A20'},
    {n:'Cip\'s Brown Classic',d:'Brown sugar dengan choco chips. Klasik yang selalu enak.',p:5000,c:'#C99A5B'},
    {n:'Oh My Matcha',d:'Adonan matcha premium dengan white choco drizzle.',p:5000,c:'#8DAA5B'},
    {n:'Cookie n Cream',d:'Dasar Oreo dengan isian krim dan Oreo utuh di atasnya.',p:5000,c:'#8A8A8A'},
    {n:'Berry Pop Rocks',d:'Brown sugar dengan isian blueberry segar.',p:5000,c:'#7B6BC4'},
    {n:'Marsh Sprinkle Bliss',d:'Brown sugar dengan marshmallow panggang dan rainbow sprinkles.',p:5000,c:'#E58FB0'}
  ],
  brownie: [
    {n:'Basic Choco Brownie',d:'Isi 7 bite, fudgy dan pas untuk dibagi.',p:12000,c:'#4A2A20'},
    {n:'Melted Series',d:'Isi 7 bite dengan lelehan di tengah.',p:14000,c:'#6B3A2A'}
  ]
};
const rp = n => 'Rp' + n.toLocaleString('id-ID');
const $ = id => document.getElementById(id);

// ====== Render menu ======
for (const k in MENU) {
  $('grid-' + k).innerHTML = MENU[k].map(m =>
    `<article class="card"><span class="cookie" style="--c:${m.c}"></span><div><h4>${m.n}</h4><p>${m.d}</p><span class="price">${rp(m.p)}${k==='brownie'?' / pack':''}</span></div></article>`).join('');
}

// ====== Form ======
const find = () => (MENU[$('kategori').value] || []).find(m => m.n === $('varian').value);
function hitung() { const m = find(); $('total').textContent = rp(m ? m.p * (+$('qty').value || 0) : 0); }
$('kategori').onchange = () => {
  const list = MENU[$('kategori').value] || [];
  $('varian').disabled = !list.length;
  $('varian').innerHTML = '<option value="">Pilih varian</option>' + list.map(m => `<option>${m.n}</option>`).join('');
  hitung();
};
$('varian').onchange = $('qty').oninput = hitung;
$('metode').onchange = () => { $('alamatWrap').hidden = $('metode').value !== 'Diantar'; };
const besok = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
$('tanggal').min = besok;

function bersihWA(v) { v = v.replace(/\D/g, ''); return v.startsWith('0') ? '62' + v.slice(1) : v; }
function pesanWA(o) {
  return `Halo Softie's Cookie, aku mau pesan:\n- Nama: ${o.nama}\n- Pesanan: ${o.varian} x${o.qty}\n- Total: ${rp(o.total)}\n- Tanggal: ${o.tanggal}\n- Metode: ${o.metode}${o.alamat ? '\n- Alamat: ' + o.alamat : ''}${o.catatan ? '\n- Catatan: ' + o.catatan : ''}`;
}
$('waFloat').href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Halo Softie\'s Cookie, aku mau tanya-tanya dulu ya.')}`;

$('kirim').onclick = async () => {
  const st = $('status'), m = find();
  const o = { nama: $('nama').value.trim(), whatsapp: bersihWA($('wa').value), kategori: $('kategori').value, varian: $('varian').value,
    qty: +$('qty').value, tanggal: $('tanggal').value, metode: $('metode').value, alamat: $('alamat').value.trim(), catatan: $('catatan').value.trim() };
  o.total = m ? m.p * o.qty : 0;
  st.className = 'status';
  const err = !o.nama ? 'Nama wajib diisi.' : !/^62\d{8,13}$/.test(o.whatsapp) ? 'Nomor WhatsApp belum valid.' : !m ? 'Pilih kategori dan varian dulu.'
    : o.qty < 1 ? 'Jumlah minimal 1.' : !o.tanggal ? 'Pilih tanggalnya dulu.' : (o.metode === 'Diantar' && !o.alamat) ? 'Alamat pengantaran wajib diisi.' : '';
  if (err) { st.textContent = err; st.classList.add('err'); return; }
  $('kirim').disabled = true; st.textContent = 'Mengirim pesanan...';
  try {
    if (API_URL) {
      const r = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(o) });
      if (!r.ok) throw new Error('Server menolak pesanan (' + r.status + ')');
    }
    st.textContent = 'Pesanan terkirim! Lanjutkan konfirmasi lewat WhatsApp.';
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesanWA(o))}`, '_blank');
  } catch (e) {
    st.textContent = 'Gagal mengirim: ' + e.message + '. Coba lagi atau chat langsung via WhatsApp.'; st.classList.add('err');
  } finally { $('kirim').disabled = false; }
};
