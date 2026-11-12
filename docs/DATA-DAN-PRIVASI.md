# Polisi Data & Privasi — KelasPulse AI

Dokumen ini menerangkan secara telus mengenai jenis data yang dikumpulkan oleh aplikasi **KelasPulse AI**, lokasi penyimpanan, kaedah pemprosesan oleh model kecerdasan buatan, hak kawalan akses, dan prosedur pemadaman data.

---

## 1. Data yang Dikumpulkan oleh Aplikasi

Apabila peserta melengkapkan borang penilaian bengkel, sistem merekodkan maklumat berikut:

1. **Maklumat Identiti (Tertakluk kepada Pilihan Peserta)**:
   - **Jika Memilih "Log Masuk Google"**: Nama paparan (*authorName*), alamat e-mel (*authorEmail*), dan pautan gambar avatar (*authorAvatar*).
   - **Jika Memilih "Tanpa Nama" (*Anonymous*)**: Sistem TIDAK menyimpan nama, alamat e-mel, atau gambar peribadi peserta. Rekod disimpan dengan label `"Anonymous"`.
2. **Maklumat Penilaian Kuantitatif**:
   - Skor kepuasan keseluruhan bengkel (skala 1 hingga 5 bintang).
   - Skor kefahaman modul & kandungan (skala 1 hingga 5 bintang).
   - Skor penyampaian trainer (skala 1 hingga 5 bintang).
   - Skor kesetiaan dan cadangan Net Promoter Score / NPS (skala 1 hingga 10).
3. **Maklumat Kualitatif (Teks Terbuka)**:
   - Jawapan soalan refleksi: *"Perkara paling bermanfaat yang dipelajari"*.
   - Jawapan soalan cadangan: *"Cadangan penambahbaikan untuk kelas akan datang"*.
4. **Metadata Sistem**:
   - ID unik sesi latihan (contoh: `SES-001`).
   - Cap waktu penghantaran (*timestamp*, tarikh dan masa ISO).
   - Status kelulusan moderasi (`approved` atau `hidden`).
   - Pengelasan sentimen hasil analisis AI (`Positive`, `Constructive`, atau `Neutral`).

---

## 2. Di Mana Data Disimpan?

Dalam pelaksanaan versi semasa (MVP):
- Semua rekod sesi, maklum balas, dan rumusan eksekutif disimpan di dalam **Memori Penyemak Imbas Tempatan (*Browser LocalStorage*)** pada peranti pengguna.
- Data **TIDAK dihantar ke mana-mana pangkalan data luaran atau pihak ketiga yang tidak dibenarkan**.
- Sekiranya penyemak imbas ditutup dan dibuka semula, data kekal tersimpan melainkan *cache/cookies* dibersihkan oleh pengguna.

---

## 3. Adakah Data Dihantar kepada Pihak Ketiga atau AI Luaran?

### Pemprosesan oleh Google Gemini AI:
- **Teks yang Dihantar**: Hanya teks komen terbuka (*keyTakeaway* dan *improvementSuggestion*) dihantar ke pelayan API Google Gemini (`gemini-3.8-flash`) bagi tujuan:
  1. **Saringan Keselamatan (*Safety Moderation*)**: Memastikan tiada unsur kata-kata kesat, ancaman, atau spam.
  2. **Pengelasan Sentimen**: Mengkategorikan nada respon sama ada positif, membina, atau neutral.
  3. **Penjanaan Rumusan Eksekutif**: Menghasilkan 3 kekuatan utama dan ringkasan dapatan kelas.
- **Data yang TIDAK Dihantar**: Alamat e-mel, nombor telefon, atau identiti kewangan peserta TIDAK dihantar ke dalam pemprosesan prompt AI.
- **Kunci Rahsia (*Secrets*)**: Panggilan API Gemini dibuat secara selamat melalui pelayan perantara (*backend proxy* di `server.ts`). Kunci API tidak sekali-kali didedahkan pada kod pelayar (*frontend client*).

---

## 4. Siapa yang Boleh Mengakses Data Ini?

Berdasarkan pelaksanaan semasa:
1. **Orang Awam / Peserta Dewan**:
   - Hanya boleh melihat maklum balas yang berstatus **Diluluskan (*Approved*)** pada Dinding Maklum Balas Langsung (*Public Live Wall*).
   - Komen yang dihantar dalam mod *Anonymous* tidak akan memaparkan sebarang maklumat peribadi.
2. **Tenaga Pengajar (Jurulatih)**:
   - Mempunyai akses penuh ke Papan Analitik setelah memasukkan kod PIN 4-digit yang sah (lalai: `1234`).
   - Boleh melihat senarai semua maklum balas (termasuk yang ditahan oleh AI), pecahan markah terperinci, dan mengeksport lembaran kerja CSV.

---

## 5. Kaedah Pemadaman dan Kawalan Data

Pengguna mempunyai hak kawalan penuh ke atas data bengkel mereka:
- **Pemadaman Sesi Individu (BR-005)**: Di dalam Papan Analitik, trainer boleh menekan butang ikon tong sampah untuk memadamkan sesuatu sesi. Tindakan ini memadamkan sesi tersebut berserta semua rekod maklum balas di bawahnya secara kekal.
- **Set Semula Lengkap Data (*Reset Demo Data*)**: Melalui menu **Tetapan Pentadbir**, trainer boleh menekan butang *Set Semula ke Data Asal* untuk memadamkan semua data baharu dan mengembalikan aplikasi kepada 2 sesi contoh lalai.
- **Pembersihan Manual Pelayar**: Pengguna boleh memadam keseluruhan rekod pada bila-bila masa dengan mengosongkan *Site Data / LocalStorage* dalam tetapan penyemak imbas mereka.

---

## 6. Kenyataan Batasan & Pematuhan

- Aplikasi ini dibangunkan sebagai instrumen pengumpulan maklum balas latihan pendidikan dan korporat.
- Walaupun ciri privasi asas (seperti mod *Anonymous* dan penapisan data peribadi) telah dilaksanakan, aplikasi ini belum menjalani audit undang-undang rasmi bagi akta privasi khusus (seperti Akta Perlindungan Data Peribadi / PDPA atau GDPR).
- Organisasi yang menggunakan aplikasi ini untuk tujuan rasmi dinasihatkan untuk tidak meminta peserta memasukkan maklumat peribadi sensitif (seperti nombor kad pengenalan, maklumat perbankan, atau rekod kesihatan) di dalam ruang komen terbuka.
