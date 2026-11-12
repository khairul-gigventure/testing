# KelasPulse AI

> **Sistem Pengumpulan Maklum Balas Peserta & Dinding Paparan Langsung (*Live Wall*) untuk Bengkel Kecerdasan Buatan (AI) dan Latihan Korporat.**

KelasPulse AI membantu tenaga pengajar (*trainer*) mengumpul penilaian peserta bengkel dalam masa kurang daripada 60 saat melalui imbasan kod QR, menayangkan respon positif secara langsung di skrin dewan, serta menjana rumusan eksekutif pintar menggunakan Gemini AI.

---

## Masalah yang Diselesaikan

Dalam kebanyakan bengkel latihan dan seminar:
1. **Borang manual atau Google Form tradisional lambat diisi**: Peserta sering menangguhkan pengisian borang penilaian panjang, menyebabkan kadar maklum balas rendah selepas kelas tamat.
2. **Ketiadaan interaksi masa nyata (*live interaction*)**: Peserta tidak dapat melihat impak pembelajaran rakan sekelas secara langsung di dalam dewan.
3. **Trainer mengambil masa berjam-jam untuk menganalisis**: Pengajar terpaksa membaca satu persatu komen terbuka dan mengira skor *Net Promoter Score* (NPS) secara manual untuk diserahkan kepada pihak pengurusan atau penaja latihan.

**KelasPulse AI menyelesaikan masalah ini** dengan menyediakan borang imbasan kod QR pantas, penayangan respon yang selamat secara automatik di skrin projektor, dan penjanaan rumusan analitik eksekutif dengan satu klik.

---

## Untuk Siapa Aplikasi Ini?

- **Tenaga Pengajar & Jurulatih (*Trainers / Facilitators*)**: Menilai keberkesanan pengajaran, memaparkan testimoni bilik darjah secara dinamik, dan mendapatkan rumusan analitik serta-merta.
- **Peserta Kursus (*Participants*)**: Memberikan penilaian telus dan pantas (pilihan akaun Google atau tanpa nama / *Anonymous*) terus dari telefon pintar tanpa perlu memuat turun sebarang aplikasi.
- **Pengurus Latihan & Penaja (*Training Organizers / HR / Sponsors*)**: Menerima laporan prestasi lengkap dalam format PDF dan lembaran kerja CSV (UTF-8) untuk rekod latihan dan tuntutan penajaan (seperti HRD Corp).

---

## Apa yang Boleh Dibuat?

- **Pengurusan Sesi Bengkel**: Cipta sesi latihan baharu dengan kod unik (contoh: `SES-001`), tarikh, dan nama jurulatih.
- **Paparan Kod QR 1-Klik**: Pancarkan kod QR resolusi tinggi pada skrin bilik darjah atau muat turun fail grafik SVG.
- **Borang Penilaian Mesra Telefon (< 60 Saat)**:
  - Pilihan identiti: Profil Google atau mod sulit Tanpa Nama (*Anonymous*).
  - 3 penilaian bintang berserta label emosi (Kepuasan Kelas, Kandungan Modul, Penyampaian Trainer).
  - Skala *Net Promoter Score* (NPS 1–10) dengan pengekodan warna intuitif.
  - Soalan refleksi pembelajaran dan cadangan penambahbaikan berserta cadangan topik pantas.
- **Dinding Maklum Balas Langsung (*Public Live Wall*)**:
  - Penstriman maklum balas secara langsung (*marquee stream*) dengan fungsi jeda automatik semasa tetikus dihampirkan.
  - Pilihan Mod Grid Interaktif untuk perbincangan kelas.
  - **Peringkat Sorotan Pembentang (*Speaker Spotlight Mode*)**: Format slaid berdefinisi tinggi untuk jurulatih mengetengahkan ulasan menarik menggunakan kekunci arah papan kekunci (`←`, `→`).
  - Dwi-tema paparan: *Mod Projektor Gelap* (sesuai untuk dewan seminar malap) dan *Mod Kertas Cerah*.
  - Kod QR terapung di sudut skrin bagi memudahkan peserta yang lewat mengimbas.
- **Saringan Keselamatan Kandungan Automatik (*AI Moderasi*)**: Komen disaring oleh Gemini AI untuk memastikan tiada perkataan lucah, serangan peribadi, atau spam sebelum dipaparkan di skrin awam.
- **Papan Pemuka Analitik Eksekutif (*Admin Dashboard*)**:
  - Dilindungi kod PIN keselamatan 4-digit (`1234`).
  - Paparan metrik utama (Jumlah Responden, Purata Kepuasan, dan tolok pecahan peratusan NPS).
  - **Rumusan Eksekutif AI (*AI Executive Summary*)**: Menjana 3 kekuatan utama, cadangan penambahbaikan, dan kesimpulan menyeluruh secara automatik.
  - Jadual moderasi dengan butang lulus/sorok (*Approve/Hide*) 1-klik.
  - Eksport data ke format CSV dan tetingkap cetakan laporan rasmi PDF.

---

## Contoh Cara Penggunaan

1. **Sebelum Kelas Bermula**: Jurulatih membuka aplikasi, memilih atau mencipta sesi latihan (contoh: *Bengkel AI Produktiviti*), dan menekan butang **Kod QR Sesi**.
2. **Semasa Sesi Maklum Balas**: Jurulatih memancarkan Dinding Langsung (*Live Wall*) di layar projektor utama bersama kod QR.
3. **Tindakan Peserta**: Peserta mengimbas kod QR menggunakan telefon pintar, memilih identiti (nama sendiri atau tanpa nama), memberi rating bintang, skor NPS, dan menulis satu perkara paling bermanfaat yang dipelajari.
4. **Penayangan Masa Nyata**: Komen yang melepasi saringan AI akan muncul serta-merta di Dinding Langsung projektor untuk diraikan bersama seluruh dewan.
5. **Selepas Kelas**: Jurulatih membuka **Papan Analitik** menggunakan PIN `1234`, menekan butang **Jana Rumusan AI** untuk mendapatkan sintesis pintar, dan memuat turun fail CSV atau mencetak laporan PDF untuk dokumentasi.

---

## Cara Mencuba Aplikasi

- **Pautan Aplikasi Langsung**: [Buka KelasPulse AI](https://ais-pre-5kdfpfv5z662mahzvphlu5-759910934406.asia-east1.run.app)
- **PIN Lalai Akses Pentadbir**: `1234`
- **Data Contoh (Demo)**: Aplikasi telah dilengkapi 2 sesi contoh dan 12 maklum balas siap sedia untuk tujuan demonstrasi.

---

## Status Projek Semasa

| Aspek | Status Semasa | Nota Penting |
| :--- | :--- | :--- |
| **Antaramuka & Modul MVP** | **Sudah Dibina & Berfungsi Penuh** | Semua 8 fungsi utama (FR-001 hingga FR-008) telah siap. |
| **Ujian Kod & Aliran Skrin** | **Telah Diuji Secara Tempatan** | Melepasi semakan pembinaan TypeScript (`tsc --noEmit`) dan *production build* Vite. |
| **Penyimpanan Data** | **Penyemak Imbas Tempatan (*Browser LocalStorage*)** | Data sesi dan maklum balas disimpan dalam pelayar peranti semasa. |
| **Saringan AI & Rumusan** | **Berfungsi dengan Sandaran Automatik** | Menggunakan model `gemini-3.8-flash` melalui pelayan Express, dilengkapi fungsi sandaran peraturan tempatan (*heuristic fallback*) jika kunci API tiada. |
| **Sinkronisasi Rentas Peranti Berasingan** | **Masih Dirancang (Roadmap)** | Untuk bengkel sebenar di mana 50 telefon peserta bersambung serentak ke projektor berasingan, pangkalan data awan (seperti Firebase Firestore) diperlukan. |

---

## Panduan Lanjut

Sila rujuk dokumentasi terperinci dalam folder `docs/`:

- [Panduan Pengguna Langkah demi Langkah](docs/PANDUAN-PENGGUNA.md) — Panduan bergambar untuk jurulatih dan peserta.
- [Spesifikasi Keperluan Produk (PRD)](docs/KEPERLUAN-PRODUK.md) — Skop MVP, peraturan bisnes, dan kriteria penerimaan.
- [Status Pembangunan & Perancangan Masa Depan](docs/STATUS-DAN-ROADMAP.md) — Senarai fungsi diuji, isu diketahui, dan pelan peningkatan.
- [Pengendalian Data & Privasi](docs/DATA-DAN-PRIVASI.md) — Penjelasan tentang data yang dikumpul, cara simpanan, dan keselamatan AI.
- [Panduan Pemasangan & Penyelenggaraan Teknikal](docs/SETUP-DAN-PENYELENGGARAAN.md) — Cara memuat turun, memasang dependencies, dan menjalankan kod di komputer sendiri.
- [Log Perubahan Versi (Changelog)](CHANGELOG.md) — Rekod penambahbaikan dan versi aplikasi.

---

## Ringkasan Teknologi yang Digunakan

- **React 19 & TypeScript**: Digunakan untuk membina struktur paparan dan interaksi pengguna yang pantas serta bebas ralat taip.
- **Vite**: Alat pembina (*bundler*) moden yang membolehkan pembangunan web dijalankan dengan kelajuan tinggi.
- **Express (Node.js)**: Pelayan perantaraan (*backend proxy*) untuk memproses panggilan keselamatan dan kecerdasan buatan tanpa mendedahkan kunci rahsia.
- **Tailwind CSS v4**: Mengurus reka bentuk visual profesional, mod projektor gelap, dan tipografi responsif.
- **Google Gen AI SDK (`@google/genai`)**: Mengintegrasikan model kecerdasan buatan `gemini-3.8-flash` bagi tujuan saringan kandungan dan analisis sentimen.
- **Lucide React**: Koleksi ikon antaramuka moden.
- **qrcode.react & canvas-confetti**: Komponen untuk menjana kod QR vektor SVG dan animasi keraian selepas borang dihantar.

---

## Maklum Balas & Bantuan

Sekiranya anda menemui sebarang isu teknikal, ralat paparan, atau mempunyai cadangan penambahbaikan, anda dialu-alukan untuk membuka tiket laporan melalui bahagian **Issues** di repositori GitHub ini.

*(Nota: Repositori ini diuruskan sebagai projek tertutup/persendirian mengikut kebenaran pemilik projek).*
