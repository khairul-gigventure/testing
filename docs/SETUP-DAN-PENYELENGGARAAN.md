# Panduan Pemasangan & Penyelenggaraan Teknikal

Dokumen ini menyediakan panduan terperinci untuk jurutera perisian, pentadbir sistem, atau sesiapa yang ingin menjalankan, menguji, dan menyelenggara aplikasi **KelasPulse AI** pada komputer sendiri (*local environment*) atau pelayan awan.

---

## 1. Keperluan Sistem Minimum

Sebelum memulakan, pastikan komputer anda telah dipasang dengan perisian berikut:

- **Node.js**: Versi `20.x` atau lebih tinggi (disyorkan versi LTS). Anda boleh menyemak dengan menaip `node -v` dalam terminal.
- **npm**: Versi `10.x` atau lebih tinggi (disertakan bersama pemasangan Node.js).
- **Pelayar Web Moden**: Google Chrome, Mozilla Firefox, Microsoft Edge, atau Safari versi terkini.
- **Kunci API Gemini (Pilihan tetapi Disyorkan)**: Kunci percuma boleh didapati dari [Google AI Studio](https://aistudio.google.com/). *(Jika kunci tiada, sistem secara automatik menggunakan modul sandaran saringan peraturan tempatan tanpa ralat)*.

---

## 2. Langkah-Langkah Pemasangan (Setup)

### Langkah 1: Klon atau Buka Direktori Projek
Buka terminal dan masuk ke folder projek:
```bash
cd kelaspulse-ai
```

### Langkah 2: Pasang Dependencies
Pasang semua pakej pustaka yang disenaraikan di dalam `package.json`:
```bash
npm install
```
*Tindakan ini akan memuat turun pustaka seperti React 19, Express, Vite, Tailwind CSS, Lucide Icons, dan Google Gen AI SDK ke dalam folder `node_modules`.*

### Langkah 3: Konfigurasi Environment Variables
Salin fail contoh `.env.example` kepada fail sebenar `.env`:
```bash
cp .env.example .env
```

Buka fail `.env` dan masukkan nilai yang berkaitan:
```env
# Kunci API Google Gemini untuk saringan kandungan dan rumusan automatik
GEMINI_API_KEY="AIzaSyYourActualGeminiApiKeyHere"

# URL asas aplikasi (digunakan untuk penjanaan pautan QR kod)
APP_URL="http://localhost:3000"

# Port pelayan (Lalai: 3000)
PORT=3000
```
> **Nota Keselamatan Penting**: Jangan sekali-kali menolak fail `.env` yang mengandungi kunci API sebenar ke repositori GitHub awam. Fail `.gitignore` projek telah dikonfigurasikan untuk mengabaikan fail `.env`.

---

## 3. Menjalankan Aplikasi

### Mod Pembangunan (*Development Mode*)
Untuk memulakan pelayan pembangunan tempatan dengan sokongan *Live Reload*:
```bash
npm run dev
```
- Pelayan akan dimulakan pada: `http://localhost:3000`
- Kod sumber TypeScript diproses secara masa nyata melalui `tsx server.ts` yang menggabungkan pelayan Express dengan middleware Vite.

### Mod Semakan Kualiti Kod (*Type Checking & Linting*)
Untuk memastikan tiada ralat jenis TypeScript atau ralat sintaksis:
```bash
npm run lint
```
*(Perintah ini menjalankan `tsc --noEmit` untuk mengesahkan integriti kod).*

### Membina untuk Pelayan Sebenar (*Production Build*)
Untuk membina aset kod yang telah dioptimumkan dan dimampatkan:
```bash
npm run build
```
- Aset web yang telah dikompilasi akan disimpan di dalam folder `dist/`.

### Menjalankan Mod Produksi (*Production Run*)
Selepas menjalankan `npm run build`, lancarkan pelayan produksi:
```bash
npm start
```
Aplikasi kini bersedia untuk menerima trafik pengguna sebenar pada port `3000`.

---

## 4. Struktur Fail & Modul Utama

```
├── .env.example              # Contoh konfigurasi pembolehubah persekitaran
├── .gitignore                # Senarai fail yang diabaikan oleh Git
├── CHANGELOG.md              # Rekod sejarah perubahan versi
├── README.md                 # Dokumentasi pengenalan awam projek
├── index.html                # Templat HTML utama berserta integrasi fon
├── metadata.json             # Metadata aplikasi Google AI Studio
├── package.json              # Definisi dependencies dan skrip pembangunan
├── server.ts                 # Pelayan Express (API Moderasi, Rumusan, dan Vite middleware)
├── tsconfig.json             # Konfigurasi pengkompil TypeScript
├── vite.config.ts            # Konfigurasi pembina Vite & plugin Tailwind v4
├── docs/                     # Dokumentasi terperinci projek
│   ├── DATA-DAN-PRIVASI.md
│   ├── KEPERLUAN-PRODUK.md
│   ├── PANDUAN-PENGGUNA.md
│   ├── SETUP-DAN-PENYELENGGARAAN.md
│   └── STATUS-DAN-ROADMAP.md
└── src/                      # Kod sumber aplikasi
    ├── App.tsx               # Komponen induk & pengurusan keadaan (state)
    ├── index.css             # Gaya global, fon, dan animasi marquee
    ├── main.tsx              # Titik masuk pemulaan React DOM
    ├── components/           # Komponen antaramuka
    │   ├── AdminDashboard.tsx      # Papan analitik, reben KPI & jadual moderasi
    │   ├── FeedbackDetailModal.tsx # Tetingkap perincian maklum balas
    │   ├── LiveWall.tsx            # Dinding projektor siaran langsung & spotlight
    │   ├── Navbar.tsx              # Bar atas navigasi & penukar sesi
    │   ├── NewSessionModal.tsx     # Tetingkap pendaftaran sesi baharu
    │   ├── ParticipantForm.tsx     # Borang bertingkat 3-langkah mesra telefon
    │   ├── PrintReportModal.tsx    # Templat laporan cetakan rasmi PDF
    │   ├── QRCodeModal.tsx         # Tetingkap paparan kod QR & muat turun SVG
    │   └── SettingsModal.tsx       # Tetingkap tetapan PIN & set semula demo
    ├── services/             # Logik data & komunikasi API
    │   ├── aiService.ts            # Panggilan ke endpoint moderasi dan rumusan
    │   └── storageService.ts       # Pengurusan penyimpanan LocalStorage & set data demo
    └── types/                # Definisi TypeScript interface & types
        └── index.ts                # Struktur data Session, Feedback, Summary, Profile
```

---

## 5. Panduan Penerbitan (*Deployment*)

### Pilihan 1: Google Cloud Run (Disyorkan)
Aplikasi ini dioptimumkan sepenuhnya untuk persekitaran kontena seperti Google Cloud Run:
1. Pastikan perkhidmatan membaca port daripada `process.env.PORT` (telah dikonfigurasikan secara lalai dalam `server.ts`).
2. Masukkan `GEMINI_API_KEY` di bahagian *Cloud Run Environment Variables & Secrets*.
3. Perintah pemulaan kontena ialah: `node dist/server.js` atau `npm start`.

### Pilihan 2: Docker Container
Contoh `Dockerfile` ringkas:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 6. Penyelesaian Masalah Teknikal (*Troubleshooting*)

| Gejala Ralat | Punca Kemungkinan | Tindakan Pembetulan |
| :--- | :--- | :--- |
| **`EADDRINUSE: address already in use :::3000`** | Port 3000 sedang digunakan oleh aplikasi lain. | Matikan proses sedia ada dengan perintah `npx kill-port 3000` atau tukar nilai `PORT=3001` dalam fail `.env`. |
| **`PERMISSION_DENIED (403)` daripada Gemini API** | Kunci API tiada kebenaran atau tidak sah. | Sistem secara automatik beralih ke sandaran peraturan tempatan. Untuk mengaktifkan AI sebenar, periksa kesahihan kunci di Google AI Studio. |
| **WebSocket Connection Failed / HMR Error** | Pelayan proksi atau persekitaran iFrame menyekat sambungan HMR. | Skrip penapis ralat telah dimasukkan di dalam `index.html` untuk mengabaikan gangguan ini tanpa menjejaskan fungsi utama aplikasi. |
| **Perubahan CSS tidak kelihatan** | Cache pelayar atau Tailwind v4 build cache. | Tekan `Ctrl + Shift + R` (atau `Cmd + Shift + R` pada Mac) untuk melakukan muat semula penuh (*hard refresh*). |
