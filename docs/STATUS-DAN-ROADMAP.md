# Status Pembangunan & Perancangan Masa Depan (Roadmap)

Dokumen ini merekodkan status sebenar setiap ciri dalam **KelasPulse AI**, membezakan dengan telus antara apa yang telah dibina, apa yang telah diuji, batasan semasa, dan perancangan masa hadapan tanpa sebarang tarikh atau janji siap yang direka-reka.

---

## 1. Ciri yang Sudah Dibina (*Built Features*)

Semua fungsi MVP teras telah dibangunkan dan disepadukan ke dalam antara muka aplikasi:

- [x] **Pendaftaran & Pemilihan Sesi Bengkel (FR-001)**: Penciptaan sesi dengan nama, tarikh, trainer, dan ID unik automatik.
- [x] **Modal Kod QR Berdefinisi Tinggi**: Paparan kod QR SVG dinamik dengan pautan ujian pantas dan muat turun fail SVG.
- [x] **Borang Peserta 3-Langkah Mesra Telefon (FR-002, FR-003)**:
  - Pilihan identiti Google atau Anonymous.
  - Penilaian bintang dengan penerangan emosi.
  - Pilihan skala Net Promoter Score (NPS 1–10).
  - Soalan refleksi terbuka berserta cadangan topik interaktif.
- [x] **Integrasi Saringan Gemini AI (FR-004)**: Endpoint `/api/moderate` dan `/api/summarize` menggunakan `gemini-3.8-flash` dengan fungsi sandaran peraturan heuristik (*rule-based fallback*).
- [x] **Dinding Maklum Balas Langsung Projektor (FR-005)**:
  - Mod aliran berterusan (*marquee stream*) dengan jeda hover.
  - Mod grid interaktif (*interactive grid*).
  - Peringkat sorotan pembentang (*Speaker Spotlight Mode*) berserta navigasi kekunci papan kekunci (`←`, `→`).
  - Dwi-tema paparan: *Cinema Dark Mode* dan *Light Paper Mode*.
  - Widget kod QR terapung di sudut skrin.
- [x] **Papan Pemuka Analitik Pentadbir (FR-006)**:
  - Perlindungan PIN keselamatan 4-digit (`1234`).
  - Jalur metrik KPI (Responden, Kepuasan, Modul, Trainer).
  - Tolok agihan NPS tersegmen (Promoters %, Passives %, Detractors %).
  - Jadual moderasi dengan carian teks dan butang lulus/sorok 1-klik.
- [x] **Penjanaan Rumusan Eksekutif AI (FR-007)**: Sintesis 3-bahagian (Kekuatan, Penambahbaikan, Kesimpulan) berserta butang salin satu klik.
- [x] **Eksport Dokumen Lengkap (FR-008)**:
  - Fail CSV berformat UTF-8 BOM untuk Microsoft Excel.
  - Pratonton cetakan laporan rasmi format PDF.
- [x] **Sistem Pengurusan Tetapan & Demo**: Butang tukar PIN admin dan fungsi set semula data contoh.

---

## 2. Ciri yang Telah Diuji (*Tested Features*)

Pengujian yang telah dijalankan merangkumi:

1. **Ujian Pembinaan Kod (*Code Compilation & Type Check*)**:
   - Melepasi semakan jenis TypeScript (`tsc --noEmit`) tanpa ralat.
   - Melepasi binaan produksi Vite (`npm run build`) tanpa sebarang kegagalan import.
2. **Ujian Aliran Pengguna Tempatan (*Local User Flow Testing*)**:
   - Pengisian borang peserta pada pelbagai saiz skrin (mudah alih, tablet, desktop).
   - Pengujian validasi input borang (menghalang penghantaran teks kosong atau kurang daripada 5 aksara).
   - Animasi keraian konfeti dan petunjuk visual penerimaan borang.
   - Buka kunci pentadbir menggunakan PIN `1234` dan penolakan PIN yang salah.
   - Pengalihan moderasi komen (*Approve* dan *Hide*) dengan kemas kini status Dinding Langsung serta-merta.
   - Penjanaan semula rumusan AI dan fungsi salin teks ke papan keratan (*clipboard*).
   - Pengesahan struktur fail CSV yang dimuat turun mengandungi tajuk lajur dan data teratur.

---

## 3. Perkara yang Belum Disahkan / Batasan Semasa (*Unverified / Limitations*)

Pihak pembangun dan pengguna perlu mengambil perhatian terhadap batasan teknikal semasa berikut:

- **Penyimpanan Setempat Pelayar (*Browser LocalStorage*)**:
  - Pada masa ini, data sesi dan maklum balas disimpan di dalam memori pelayar peranti (`localStorage`).
  - **Kesan Batasan**: Sekiranya peserta mengimbas kod QR menggunakan telefon pintar peribadi mereka di luar rangkaian pelayan yang sama atau dalam peranti berasingan tanpa pangkalan data awan terpusat, maklum balas tersebut hanya tersimpan pada telefon peserta itu sendiri.
- **Sambungan Pangkalan Data Awan Sebenar (*Cloud Database*)**:
  - Walaupun arkitektur aplikasi telah siap sepenuhnya untuk menyokong pertukaran data masa nyata, integrasi perkhidmatan pangkalan data awan terpusat (seperti Firebase Firestore atau PostgreSQL Cloud SQL) masih belum diaktifkan.
- **Pengesahan Akaun Google Sebenar (*Real Google OAuth*)**:
  - Mod log masuk Google pada masa ini menggunakan simulasi profil peserta (nama dan gambar avatar demo) untuk mengelakkan keperluan pendaftaran OAuth luaran yang rumit semasa demonstrasi MVP.

---

## 4. Isu Diketahui (*Known Issues*)

1. **Pembersihan Cache Pelayar**: Menjalankan fungsi *Clear Browsing Data* atau menggunakan mod *Incognito* akan memadam rekod sesi tempatan. (Pengguna dinasihatkan mengeksport fail CSV secara berkala).
2. **Had Kadar Panggilan AI (*API Rate Limits*)**: Sekiranya kunci API Gemini mencapai had kuota percuma, sistem akan beralih ke mod sandaran peraturan tempatan secara automatik bagi mengelakkan gangguan aliran kerja.

---

## 5. Perancangan Seterusnya (*Roadmap*)

Berikut merupakan perancangan penaiktarafan yang dirancang secara berfasa:

### Fasa 1: Pengukuhan Pangkalan Data Awan (Prioriti Tinggi)
- [ ] Menyambungkan pangkalan data awan terpusat (Firebase Firestore) supaya peserta di dewan latihan boleh menghantar maklum balas terus ke projektor trainer dari telefon peribadi masing-masing secara masa nyata (*real-time multi-device sync*).
- [ ] Menambah pengesahan Google Sign-In 1-klik sebenar.

### Fasa 2: Ciri Interaktif Tambahan (Prioriti Sederhana)
- [ ] **Sokongan Bilik Pecahan (*Breakout Rooms / Tracks*)**: Membolehkan persidangan besar dengan beberapa dewan selari diuruskan di bawah satu akaun trainer.
- [ ] **Reaksi Emoji Masa Nyata di Live Wall**: Membolehkan peserta menekan butang reaksi mikro (👍, 👏, 💡, ❤️) semasa trainer mengajar.
- [ ] **Graf Trend Sentimen Masa Nyata**: Paparan carta masa mengenai perubahan tahap kepuasan sepanjang modul bengkel berlalu.

### Fasa 3: Integrasi Pengurusan Latihan (Prioriti Masa Depan)
- [ ] Integrasi webhook atau API untuk menghantar laporan terus ke sistem Learning Management System (LMS) atau HRMS korporat.
- [ ] Penjanaan sijil kehadiran digital automatik untuk peserta selepas melengkapkan borang maklum balas.
