# RUKUN — situs statis Toko Kopi RUKUN

Situs statis HTML/CSS/JS native (tanpa server, tanpa framework runtime). Brand pengganti: **Toko Kopi RUKUN**.

## Cara membuka
Folder ini adalah **hasil akhir** situs. Buka `index.html` (redirect ke `id/index.html`) atau langsung
`id/index.html` dengan double-click di browser. Semua link relatif, jadi jalan dari `file://` maupun saat
folder ini di-upload ke hosting statis mana pun.

## Struktur
```
index.html                 → redirect ke id/index.html
id/   index, tentang-kami, lokasi, surat-kabar, galeri, surat-kabar/<artikel>.html
en/   index, about, locations, newsletter, gallery, newsletter/<article>.html
links.html, privacy-policy.html, terms-and-conditions.html, 404.html
assets/
  css/style.css            (CSS hasil build, statis)
  js/main.js               (semua interaksi, vanilla JS)
  img/*.jpg                (foto Unsplash, sudah diunduh lokal)
  media/                   (video screensaver & lagu dari Mixkit)
  fonts/                   (DM Mono + Caveat Brush, lisensi OFL)
```
Artikel surat kabar saat ini: `kopi-dingin-pagi-dan-sore`, `pagi-bersama-tetangga-kemang`,
`sepuluh-ribu-pohon-kintamani` (slug sama di `id/` dan `en/`).

## Mengubah konten
Folder ini hanya berisi keluaran statis. Sumber generator (`src/`: `data.mjs`, `art.mjs`, `build.mjs`,
`input.css`) dan `docs/` **tidak ada di
sini**; kalau masih punya, simpan di folder induk. Tanpa generator, edit langsung file HTML
(`id/` dan `en/` harus diubah berpasangan) dan `assets/css/style.css`.

Kalau generator dipakai kembali (`cd src && npm install && npm run build`), `build` akan menimpa semua
`*.html` dan `style.css` di sini, jadi perubahan manual harus dipindahkan ke sumbernya.

## Interaksi & state yang dibuat
- Bar "10 tahun langkah bersama" → modal salam (otomatis muncul sekali, disimpan di localStorage) dengan tab
  Salam / Seirama (pemutar lagu) / Fitzroy.
- Header sticky (home) / transparan → solid saat scroll; dropdown bahasa ID/EN; menu mobile full-screen dengan
  animasi stagger.
- Hero ilustrasi interaktif: barista mengikuti kursor (mobile: mengikuti scroll horizontal), 6 hotspot berkedip
  bergantian, label saat hover, ojol meluncur saat hover "Ambil di sini", klik → scroll ke lini produk.
- Lini produk: tab kategori, filter bahan, skeleton loading, foto berganti dengan animasi slide, kartu info
  (desktop) / modal info (mobile).
- Tetangga: drag-to-scroll, latar berubah warna & label naik saat hover.
- Serbarukun: kartu → modal produk dengan galeri thumbnail.
- Papan surat kabar: hover poster meredupkan poster lain.
- Footer: carousel toko + "RUKUN terdekat" (geolocation).
- Screensaver: muncul saat idle 90 dtk atau tab ditinggal, klik untuk menutup.
- Tentang: balon kata muncul berurutan, tab tahun "Langkah RUKUN", section sticky "kampung" (toko muncul saat
  scroll + penghitung) dengan modal tiap unit.
- Galeri: tab Kegiatan/Toko, skeleton, lightbox (prev/next, thumbnail, panah keyboard).
- Lokasi: filter wilayah & layanan, "Muat toko lainnya", empty state, modal info toko.
- Surat kabar: tab sticky lompat ke section, polaroid aktif/nonaktif; artikel dengan slider + "Kabar lainnya".
- Semua modal: overlay, Esc, focus trap, kembali fokus; `prefers-reduced-motion` dihormati.

## Catatan teknis
- **Font**: Caveat Brush (+size-adjust) untuk judul tulisan tangan dan DM Mono untuk teks isi.
- **Ilustrasi**: SVG buatan sendiri dan foto Unsplash dengan treatment "tinta" (grayscale + multiply).
- **Konten**: seluruh teks ditulis baru. Halaman legal hanya tersedia dalam Bahasa Indonesia.

## Placeholder yang perlu kamu ganti
Nama brand/logo RUKUN, PT Karya Rukun Sejahtera, Sekawan Group & daftar perusahaannya, nomor WA
(+62 812 0000 1010/2020), email `halo@rukun.coffee`, alamat 12 toko (fiktif), link sosial & marketplace
(mengarah ke beranda platform), harga produk, lagu "Seirama" (musik Mixkit).

## Kredit aset
Foto: Unsplash (lisensi Unsplash). Video screensaver & musik: Mixkit (lisensi gratis Mixkit).
Font: DM Mono & Caveat Brush (SIL Open Font License).
