# Untuk Nabila — dari Salman

Sebuah website 3D bertema "bucin" dengan nuansa biru yang lembut, dibuat oleh
**Muhammad Salman Azizi** untuk **Nabila Trilia Azzahra**.

## Isi

- **Latar 3D** partikel berbentuk hati yang melayang (Three.js).
- **Galeri foto 3D** berbentuk carousel silinder — bisa ditarik, digeser, atau dibiarkan berputar sendiri.
- **Surat** dalam kartu kaca (glassmorphism).
- **Penghitung waktu** yang terus berjalan.
- **Kartu alasan** lengkap dengan ikon.
- Kursor kustom, efek ketik, dan animasi reveal saat scroll.

Tidak menggunakan emoji — semua ikon memakai SVG.

## Menjalankan

Karena memuat tekstur gambar, jalankan lewat server lokal (bukan dibuka langsung
sebagai `file://`):

```bash
# Python
python -m http.server 8080
# atau Node
npx serve .
```

Lalu buka `http://localhost:8080`.

## Kustomisasi

- **Tanggal mulai penghitung**: ubah `START_DATE` di bagian atas `js/main.js`
  (ingat: bulan dimulai dari 0, jadi `5` = Juni).
- **Kalimat berjalan di hero**: ubah `TYPE_LINES` di `js/main.js`.
- **Foto**: letakkan di `assets/photos/` dengan nama `photo1.jpeg` … `photo14.jpeg`.

## Teknologi

HTML, CSS, dan JavaScript murni + [Three.js](https://threejs.org) (lewat CDN).
