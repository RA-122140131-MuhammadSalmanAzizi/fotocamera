# Untuk Nabila — dari Salman

Sebuah website 3D bertema "bucin" dengan nuansa biru yang lembut, dibuat oleh
**Muhammad Salman Azizi** untuk **Nabila Trilia Azzahra**.

## Isi

Satu dunia 3D imersif yang dibangun dengan Three.js + shader GLSL:

- **Hati raksasa dari ~7000 partikel** (shader custom) yang berdetak seperti
  jantung dan terbentuk dari serpihan beterbangan saat halaman dibuka.
- **Nebula biru bergerak** (fbm noise shader) + starfield, dengan **bloom**
  sinematik (post-processing).
- **Foto melayang mengelilingi hati** — bisa **di-orbit (drag)**, **zoom (scroll)**,
  hover untuk membesar, dan **klik untuk membawa foto terbang ke depan** + caption.
- **Klik ruang kosong** memunculkan ledakan partikel hati.
- Tombol **Hujan Hati**, **Surat** (kartu kaca), dan **Reset** tampilan.
- Penghitung hari kebersamaan, efek ketik, kursor & HUD elegan.

Tidak menggunakan emoji — semua ikon memakai SVG.

## Kontrol

- Tarik / geser: memutar dunia.
- Scroll / cubit: memperbesar.
- Klik foto: fokus + caption. Klik lagi di area kosong: kembali.
- Klik ruang kosong: ledakan hati.

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

- **Tanggal jadian**: ubah `START_DATE` di atas `js/main.js`
  (bulan dimulai dari 0, jadi `4` = Mei → sekarang 5 Mei 2025).
- **Caption foto**: ubah array `CAPTIONS`.
- **Kalimat berjalan**: ubah array `TYPE_LINES`.
- **Foto**: letakkan di `assets/photos/` bernama `photo1.jpeg` … `photo14.jpeg`.

## Teknologi

HTML, CSS, dan JavaScript (ES Module) + [Three.js](https://threejs.org) r160
dengan `OrbitControls`, `EffectComposer`, dan `UnrealBloomPass` (lewat CDN/importmap).
