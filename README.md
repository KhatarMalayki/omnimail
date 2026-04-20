# OmniMail

OmniMail adalah klien email desktop lintas platform tingkat profesional yang terinspirasi oleh eM Client. Dibangun dengan filosofi offline-first, OmniMail menyediakan pengalaman yang sangat aman, modern, dan berkinerja tinggi untuk mengelola komunikasi digital Anda.

## 🚀 Tumpukan Teknologi

- **Kerangka Kerja**: [Electron](https://www.electronjs.org/) + [React](https://react.dev/) (Vite) + [TypeScript](https://www.typescriptlang.org/)
- **Basis Data**: [SQLite](https://www.sqlite.org/) ([Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)) untuk pengindeksan dan penyimpanan email lokal
- **Jaringan**: 
  - [imapflow](https://imapflow.com/) (IMAP)
  - [poplib](https://github.com/ditesh/node-poplib) (POP3)
  - [mailparser](https://github.com/nodemailer/mailparser) (parsing MIME)
  - [nodemailer](https://nodemailer.com/) (SMTP)
- **Gaya**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide React Icons](https://lucide.dev/)

## 🗺️ Peta Jalan Pengembangan

### 🟢 Tonggak Sejarah 1: Inisialisasi (Selesai)
- [x] Perancah proyek dengan Electron + React + Vite + TypeScript.
- [x] Implementasi skema basis data SQLite untuk penyimpanan offline-first.
- [x] Struktur folder dan pengaturan jembatan IPC yang aman.
- [x] Dokumentasi awal dan pengaturan repositori GitHub.

### 🟢 Tonggak Sejarah 2: Mesin Multi-Protokol (Selesai)
- [x] Sinkronisasi folder penuh IMAP dengan dukungan IDLE.
- [x] Logika POP3 "Unduh & Hapus" / "Biarkan salinan di server".
- [x] Penanganan email keluar SMTP yang aman.
- [x] Sinkronisasi inkremental (header terlebih dahulu, badan email sesuai permintaan).

### 🟢 Tonggak Sejarah 3: UI/UX (Tata Letak 3 Panel) (Selesai)
- [x] Navigasi Folder & Akun (Panel 1).
- [x] Daftar Email yang dapat digulir dengan cuplikan (Panel 2).
- [x] Panel Baca iframe yang di-sandbox untuk rendering HTML yang aman (Panel 3).

### 🟢 Tonggak Sejarah 4: Keamanan, Pencarian & Lampiran (Selesai)
- [x] Penyimpanan kredensial yang aman menggunakan `electron.safeStorage`.
- [x] Manajemen lampiran dan caching lokal otomatis.
- [x] Pencarian teks lengkap (FTS5) di seluruh cache lokal dengan sinkronisasi otomatis.
- [x] UI Pencarian Global dengan hasil waktu nyata.
- [x] Daftar lampiran dan integrasi pembukaan file lokal di Reader View.

### 🟢 Tonggak Sejarah 5: Kesiapan Produksi & Distribusi (Selesai)
- [x] Penanganan Kesalahan Global & Optimasi Performa (Indeks DB & Pragmas).
- [x] UI Manajemen Multi-Akun tingkat lanjut.
- [x] Notifikasi Native untuk email baru dengan integrasi IMAP IDLE.
- [x] Modal Pengaturan & Preferensi (Tema, Notifikasi, Interval Sinkronisasi).
- [x] Konfigurasi Pengemasan (electron-builder) & Auto-Updater untuk Win/Mac/Linux.

## 🛠️ Petunjuk Penyiapan

### Prasyarat
- Node.js (v18 atau lebih baru)
- pnpm (direkomendasikan) atau npm

### Instalasi
```bash
# Kloning repositori
git clone https://github.com/KhatarMalayki/omnimail.git
cd omnimail

# Instal dependensi
pnpm install
```

### Pengembangan
```bash
# Jalankan aplikasi dalam mode pengembangan
pnpm run dev
```

### Build
```bash
# Bangun aplikasi untuk produksi
pnpm run build

# Buat paket distribusi
pnpm run dist
```

## 🔒 Keamanan
OmniMail menggunakan jembatan IPC yang aman antara proses Utama Electron dan Renderer. Semua logika protokol dan kredensial sensitif tetap berada di proses Utama, terisolasi dari lapisan UI. Kredensial akun dienkripsi menggunakan kunci asli sistem operasi melalui API `safeStorage` Electron. Email HTML dirender dalam iframe yang di-sandbox untuk mencegah eksekusi skrip dan pelacakan lintas situs.

---
*Dibuat oleh Tim OmniMail*
