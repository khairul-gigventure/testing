# Spesifikasi Keperluan Produk (PRD) — KelasPulse AI

Dokumen ini merangkumkan keperluan rasmi, skop versi minimum berdaya maju (*Minimum Viable Product* - MVP), peraturan perniagaan, dan kriteria penerimaan bagi sistem **KelasPulse AI**. 

> **Rujukan Dokumen Asal**: Dokumen ini diselaraskan berdasarkan pelan spesifikasi penuh yang terkandung dalam arkib projek: `/public/assets/aistudio/KelasPulse-AI-PRD-v1.0_5646ef95.pdf` (*KelasPulse-AI-PRD-v1.0.pdf*).

---

## 1. Tujuan Produk & Pengguna Sasaran

### 1.1 Tujuan Utama
Mewujudkan satu platform maklum balas interaktif yang membolehkan peserta bengkel latihan (khususnya bengkel AI dan kemahiran digital) memberikan maklum balas telus dalam masa bawah 60 saat, sambil membolehkan jurulatih mempamerkan sentimen positif secara langsung di layar projektor dan menghasilkan rumusan analitik segera.

### 1.2 Profil Pengguna
1. **Tenaga Pengajar / Jurulatih Latihan (*Trainer / Instructor*)**: Memerlukan cara pantas untuk mengumpul penilaian, memaparkan testimoni pada skrin dewan, menyaring kandungan negatif, dan menjana laporan prestasi kelas.
2. **Peserta Bengkel (*Learner / Participant*)**: Memerlukan borang mudah diakses melalui telefon tanpa proses pendaftaran rumit, dengan jaminan privasi pilihan tanpa nama.
3. **Penyelaras / Pengurus Latihan (*Training Coordinator / HR / Sponsor*)**: Memerlukan data kuantitatif (NPS, skor kepuasan) dan data kualitatif berstruktur (rumusan AI, fail CSV) untuk pelaporan dan tuntutan pembiayaan.

---

## 2. Skop MVP (Keperluan Fungsian — FR)

| Kod | Nama Fungsian | Penerangan Pelaksanaan |
| :--- | :--- | :--- |
| **FR-001** | **Pengurusan Sesi Latihan** | Trainer boleh mencipta sesi latihan baharu dengan memasukkan nama bengkel (3–100 aksara), tarikh pelaksanaan, dan nama pengajar/lokasi. Sistem menetapkan ID unik (contoh: `SES-001`). |
| **FR-002** | **Identiti Peserta Dwi-Pilihan** | Peserta boleh memilih sama ada mahu memaparkan identiti (simulasi profil Google dengan avatar/nama) atau memilih mod **Tanpa Nama (*Anonymous*)** bagi melindungi privasi. |
| **FR-003** | **Borang Penilaian Berstruktur (< 60s)** | Borang 3-langkah merangkumi: (1) Tiga rating skala 1–5 bintang berserta label emosi, (2) Skala Net Promoter Score 1–10, dan (3) Dua soalan terbuka (perkara paling bermanfaat & cadangan). |
| **FR-004** | **Saringan Keselamatan & Sentimen AI** | Setiap maklum balas yang dihantar diproses oleh Gemini AI (`gemini-3.8-flash`) untuk menapis bahasa kesat/spam dan mengelaskan sentimen (*Positive, Constructive, Neutral*). |
| **FR-005** | **Dinding Maklum Balas Langsung (*Live Wall*)** | Paparan skrin dewan yang memaparkan maklum balas yang diluluskan secara dinamik (aliran bergerak atau grid), dilengkapi mod projektor gelap (*Cinema Mode*), sorotan khas (*Spotlight*), dan kod QR terapung. |
| **FR-006** | **Papan Analitik & Moderasi 1-Klik** | Papan pemuka pentadbir dilindungi kod PIN keselamatan 4-digit. Memaparkan reben KPI, tolok agihan NPS, dan senarai maklum balas dengan butang *Approve / Hide* satu klik. |
| **FR-007** | **Rumusan Eksekutif Berasaskan AI** | Penjanaan rumusan sintesis pintar yang membahagikan maklum balas kepada: (1) 3 Kekuatan Utama, (2) Cadangan Penambahbaikan Tindakan, dan (3) Kesimpulan Keseluruhan. |
| **FR-008** | **Eksport Laporan (CSV & PDF)** | Muat turun fail lembaran kerja CSV dengan format UTF-8 BOM untuk Microsoft Excel, serta tetingkap pratonton cetakan laporan rasmi PDF. |

---

## 3. Peraturan Perniagaan (*Business Rules* — BR)

- **BR-001 (Kerahsiaan Identiti Anonymous)**: Sekiranya peserta memilih mod *Anonymous*, nama dipaparkan secara ketat sebagai "Anonymous", tanpa sebarang pautan kepada alamat e-mel atau identiti profil dalam apa jua paparan awam atau eksport laporan.
- **BR-002 (Pencegahan Kandungan Tidak Sesuai)**: Maklum balas yang gagal dalam saringan keselamatan AI (mengandungi perkataan lucah, ancaman, atau spam) tidak boleh dipaparkan di Dinding Langsung secara automatik. Statusnya ditandai sebagai `hidden` (ditahan) untuk semakan trainer.
- **BR-003 (Sifar Responden)**: Jika sesuatu sesi belum mempunyai sebarang maklum balas, papan analitik tidak boleh memaparkan skor ralat `NaN` atau `undefined`. Sistem mesti memaparkan notis panduan mesra mengajak trainer mempamerkan kod QR.
- **BR-004 (Formula Pengiraan NPS Rasmi)**:
  $$\text{NPS} = \% \text{Promoters (Skor 9–10)} - \% \text{Detractors (Skor 1–6)}$$
  Skor Passives (skor 7–8) diambil kira dalam jumlah penyebut tetapi tidak ditambah ke dalam peratusan bersih. Julat skor akhir adalah antara `-100` hingga `+100`.
- **BR-005 (Pemadaman Bertingkat / Cascade Delete)**: Pemadaman sesuatu sesi latihan akan memadamkan semua rekod maklum balas dan rumusan AI yang terikat di bawah sesi tersebut secara kekal selepas pengesahan amaran pengguna.

---

## 4. Aliran Kerja Pengguna Utama (*User Flows*)

```
[TRAINER]
   │
   ├─► Cipta Sesi Baharu ──► Papar Kod QR Sesi di Skrin Dewan
   │                                  │
   │                                  ▼
[PESERTA]                     Imbas Kod QR dengan Telefon Pintar
   │                                  │
   ├─► Pilih Identiti (Google / Anon) ▼
   ├─► Isi 3 Rating Bintang (Kepuasan, Modul, Trainer)
   ├─► Pilih Skor NPS (1–10)
   └─► Tulis Komen Refleksi & Cadangan ──► [TEKAN HANTAR]
                                                │
                                                ▼
                                    [GEMINI AI MODERATION]
                                                │
                               ┌────────────────┴────────────────┐
                               ▼                                 ▼
                         [Komen Selamat]                  [Komen Sensitif]
                               │                                 │
                               ▼                                 ▼
                     Status: 'approved'                Status: 'hidden'
                               │                                 │
                               ▼                                 ▼
                       Muncul di Live Wall             Ditahan dalam Papan
                      (Paparan Skrin Projektor)         Analitik untuk Semakan
                                                                 │
                                                                 ▼
                                                        [TRAINER MODERATION]
                                                        Luluskan atau Kekal Sorok
```

---

## 5. Kriteria Penerimaan (*Acceptance Criteria*)

1. **Kelajuan Pengisian**: Borang peserta boleh diselesaikan dalam masa kurang daripada 60 saat pada paparan skrin mudah alih (*mobile viewport*).
2. **Kestabilan Saringan AI**: Sekiranya kuota AI tamat atau ralat rangkaian berlaku, sistem mengaktifkan sandaran saringan tempatan tanpa menyekat penghantaran pengguna.
3. **Kekemasan Paparan Projektor**: Dinding Langsung boleh dipaparkan dalam mod skrin penuh tanpa pemotongan teks atau susun atur yang pecah.
4. **Keselamatan Pentadbir**: Bahagian analitik dan butang moderasi tidak boleh diakses oleh audiens awam tanpa memasukkan PIN keselamatan yang sah.
5. **Kebolehbacaan Fail Eksport**: Fail CSV yang dieksport boleh dibuka dalam Microsoft Excel versi Bahasa Melayu/Inggeris tanpa masalah huruf bertindih (*encoding mojibake*).
