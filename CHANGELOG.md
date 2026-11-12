# Log Perubahan (Changelog) — KelasPulse AI

Semua perubahan ketara pada projek **KelasPulse AI** akan didokumentasikan di dalam fail ini. Format penulisan adalah berdasarkan standard [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.1.0] - 2026-11-12

### Ditambah (*Added*)
- **Peringkat Sorotan Pembentang (*Speaker Spotlight Presentation Mode*)**: Mod paparan teater berdefinisi tinggi pada Dinding Langsung projektor yang membolehkan trainer menayangkan petikan komen terpilih dalam saiz fon besar berserta kawalan kekunci papan kekunci (`←`, `→`, `Esc`).
- **Kod QR Sudut Terapung (*Floating Corner QR Overlay*)**: Panel kod QR kompak pada bahagian bawah skrin projektor membolehkan peserta baharu tiba mengimbas borang pada bila-bila masa tanpa menghentikan pergerakan Dinding Langsung.
- **Dwi-Pilihan Paparan Dinding Langsung**: Penambahan togol pertukaran antara *Mod Aliran Bergerak (Marquee Stream)* dan *Mod Grid Interaktif (Interactive Grid)*.
- **Cadangan Topik Pantas pada Borang Peserta**: Butang topik interaktif (*Prompt Engineering*, *Automasi Pejabat*, *Integrasi API*) bagi memudahkan peserta mengisi ulasan dengan cepat.
- **Dokumentasi Lengkap Repositori**: Penambahan folder `docs/` merangkumi Panduan Pengguna, Spesifikasi PRD, Status & Roadmap, Data & Privasi, serta Panduan Pemasangan Teknikal.

### Dipertingkat (*Enhanced*)
- **Reka Bentuk Visual Bebas "AI Slop"**: Penjenamaan profesional dengan logo gelombang denyutan (*waveform pulse*) tersuai, penukar sesi gaya *Linear workspace*, dan tipografi korporat *Plus Jakarta Sans*.
- **Papan Pemuka Analitik Eksekutif**: Penambahan tolok agihan Net Promoter Score (NPS) tersegmen dan kad Rumusan Eksekutif bergaya laporan penyelidikan industri (McKinsey/Gartner).
- **Istilah & Salinan Bahasa Melayu Tempatan**: Penyeragaman istilah korporat dan latihan pendidikan tempatan (*Borang Penilaian Kursus*, *Dinding Maklum Balas Langsung*, *Papan Pemuka Analitik*).

### Dibaiki (*Fixed*)
- Memperbetulkan padanan *props* antara komponen `Navbar` dan `App.tsx` bagi memastikan pertukaran sesi dan lencana amaran moderasi berfungsi serentak tanpa sebarang ralat pengkompil.
- Menstabilkan sambungan pelayan pembangunan Node/Express pada port 3000 dengan sandaran selamat terhadap ralat soket web HMR.

---

## [1.0.0] - 2026-11-11

### Pelancaran Awal MVP (*Initial Release*)
- Pelaksanaan penuh kesemua 8 keperluan fungsian teras (FR-001 hingga FR-008) berasaskan dokumen PRD rasmi:
  - Pengurusan sesi latihan dan penjanaan ID sesi.
  - Penjanaan kod QR vektor SVG untuk setiap sesi bengkel.
  - Borang penilaian peserta mudah alih dengan pilihan profil Google vs Tanpa Nama (*Anonymous*), 3 penilaian bintang, skor NPS (1–10), dan soalan terbuka.
  - Integrasi API saringan keselamatan dan pengelasan sentimen menggunakan model `gemini-3.8-flash` dengan modul sandaran tempatan.
  - Dinding Langsung projektor dengan animasi aliran berterusan (*marquee stream*) dan mod projektor gelap.
  - Papan pemuka analitik dilindungi kod PIN keselamatan 4-digit (`1234`).
  - Penjanaan rumusan eksekutif 3-bahagian (3 kekuatan, cadangan penambahbaikan, kesimpulan).
  - Eksport maklum balas ke fail CSV (UTF-8 BOM) dan pratonton cetakan laporan rasmi PDF.
- Penyediaan pangkalan data contoh (*pre-seeded demo dataset*) mengandungi 2 sesi bengkel dan 12 maklum balas untuk demonstrasi segera.
