## **USER STORIES**

### **Epic 1: Aktivasi & Onboarding**

**US-1.1: Aktivasi Kode Pertama Kali**
```
Sebagai pemilik warung yang baru download app,
Saya ingin memasukkan kode aktivasi yang diberikan,
Agar saya bisa mulai menggunakan app kasir ini.

Acceptance Criteria:
- Layar pertama menampilkan field input kode (6-8 karakter)
- Tombol "Verifikasi Kode" jelas terlihat
- Jika kode benar → lanjut ke setup
- Jika kode salah → pesan error ramah + tombol "Minta Kode Baru" (buka WhatsApp)
- Ada teks penjelasan: "Kode ini dari tim kami atau partner UMKM"
```

**US-1.2: Setup Profil Usaha**
```
Sebagai pengguna yang kode aktivasinya sudah valid,
Saya ingin mengisi informasi dasar usaha saya,
Agar app bisa disesuaikan dengan kebutuhan saya.

Acceptance Criteria:
- Input: Nama usaha (wajib)
- Input: Jenis usaha (dropdown: Warung, Kedai Kopi, Toko Sembako, Lainnya)
- Pilihan mode HPP: "Sederhana" atau "Lebih Akurat"
- Daftar dengan nomor HP + verifikasi OTP
- Bisa skip password (login pakai OTP saja)
```

---

### **Epic 2: Manajemen Barang & Stok**

**US-2.1: Tambah Barang Dagangan**
```
Sebagai pemilik toko,
Saya ingin menambahkan barang dagangan dengan mudah,
Agar saya bisa catat stok dan harga untuk transaksi.

Acceptance Criteria:
- Input: Nama barang, harga jual, harga beli, stok awal
- Bisa scan barcode atau ketik manual
- Bisa tambah beberapa barang sekaligus (bulk input)
- Validasi: harga jual tidak boleh lebih kecil dari harga beli (warning saja)
```

**US-2.2: Catat Pembelian Stok Baru**
```
Sebagai pemilik warung yang baru beli stok,
Saya ingin mencatat pembelian barang dengan cepat,
Agar HPP bisa dihitung otomatis saat laporan.

Acceptance Criteria:
- Pilih barang dari daftar
- Input: Jumlah beli, harga beli saat ini
- Stok otomatis bertambah
- Data tersimpan untuk perhitungan HPP nanti
```

---

### **Epic 3: Transaksi Kasir**

**US-3.1: Proses Transaksi Penjualan**
```
Sebagai kasir warung,
Saya ingin memproses transaksi penjualan dengan cepat,
Agar pembeli tidak menunggu lama.

Acceptance Criteria:
- Tampil daftar barang favorit / search cepat
- Tambah item ke keranjang: pilih barang → input qty
- Hitung total otomatis
- Pilihan pembayaran: Cash atau Digital
- Jika Cash → tampilkan kembalian otomatis
- Setelah bayar → stok berkurang otomatis, transaksi tercatat
```

**US-3.2: Tambah Member saat Transaksi**
```
Sebagai pemilik kedai yang ingin kasih loyalty,
Saya ingin mencatat pelanggan setia dengan mudah,
Agar bisa kasih diskon atau bonus nanti.

Acceptance Criteria:
- Saat transaksi, ada opsi "Tambah Member"
- Input: Nama + nomor HP
- Bisa search member lama dengan nama/nomor
- Catat riwayat pembelian member
- Bisa kasih diskon langsung saat transaksi
```

---

### **Epic 4: Laporan Keuangan & HPP**

**US-4.1: Lihat Laporan Keuangan Fleksibel**
```
Sebagai pemilik usaha yang mau tahu untung rugi,
Saya ingin melihat laporan keuangan yang mudah dipahami,
Agar saya tahu bisnis saya untung atau tidak.

Acceptance Criteria:
- Pilih periode: Hari ini, Minggu ini, Bulan ini, Custom
- Tampil: Total Penjualan, HPP Otomatis, Laba Bersih
- Bisa tambah biaya lain (listrik, sewa) dengan toggle mudah
- Ada mode situasi: "Musim Hujan", "Ramai Lebaran", dll
- Bisa bagikan via WhatsApp atau simpan PDF
```

**US-4.2: HPP Otomatis & Reminder**
```
Sebagai pengguna yang tidak paham akuntansi,
Saya ingin HPP dihitung otomatis tanpa ribet,
Agar saya tahu laba beneran tanpa bingung hitung manual.

Acceptance Criteria:
- HPP dihitung otomatis dari: (stok awal + beli baru - sisa) x harga beli
- Jika lupa input stok akhir → reminder lembut: "Yuk input stok akhir biar akurat"
- Ada penjelasan singkat HPP dalam bahasa sederhana
- Mode "Sederhana" skip biaya rumit, mode "Akurat" lebih detail
```

---

## **FLOWCHART TEXT-BASED**

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULAI - BUKA APP PERTAMA KALI                │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  LAYAR AKTIVASI KODE   │
                    │  "Masukkan Kode"       │
                    │  [Input Field]         │
                    │  [Tombol Verifikasi]   │
                    └────────┬───────────────┘
                             │
                    ┌────────▼────────┐
                    │ Verifikasi Kode │
                    └────┬──────┬─────┘
                         │      │
                   BENAR │      │ SALAH
                         │      │
                         │      ▼
                         │  ┌──────────────────────────┐
                         │  │ Pesan Error              │
                         │  │ "Kode salah, coba lagi"  │
                         │  │ [Tombol: Minta Kode]     │
                         │  │ (Buka WhatsApp Support)  │
                         │  └──────────┬───────────────┘
                         │             │
                         │             └──────┐
                         │                    │ (Kembali input kode)
                         ▼                    │
            ┌────────────────────────┐        │
            │   SETUP PROFIL USAHA   │◄───────┘
            │ - Nama Usaha           │
            │ - Jenis Usaha          │
            │ - Pilih Mode HPP       │
            │ - Daftar HP + OTP      │
            └────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │   DASHBOARD UTAMA          │
        │ [Kasir] [Stok] [Member]    │
        │ [Laporan] [Pengaturan]     │
        └──┬──────┬──────┬──────┬────┘
           │      │      │      │
   ┌───────┘      │      │      └───────┐
   │              │      │              │
   ▼              ▼      ▼              ▼
┌─────┐      ┌────────┐ ┌──────┐   ┌─────────┐
│KASIR│      │  STOK  │ │MEMBER│   │ LAPORAN │
└──┬──┘      └───┬────┘ └──┬───┘   └────┬────┘
   │             │         │            │
   │             │         │            │
───┴─────────────┴─────────┴────────────┴───────
   
┌──────────────────────────────────────────────┐
│            ALUR TRANSAKSI KASIR              │
└──────────────────────────────────────────────┘

Buka Kasir
    │
    ▼
┌───────────────────────┐
│ Daftar Barang/Search  │
│ (Favorit di atas)     │
└──────┬────────────────┘
       │
       ▼
┌──────────────────┐
│ Pilih Barang     │──────┐
│ Input Qty        │      │ (Tambah barang lain)
└──────┬───────────┘      │
       │◄─────────────────┘
       ▼
┌─────────────────────┐
│ Keranjang Belanja  │
│ Total: Rp XXX      │
│ [+Member?]         │
└──────┬──────────────┘
       │
       ▼
  ┌────────┐
  │ Member?│
  └───┬─┬──┘
      │ │
   YA │ │ TIDAK
      │ │
      ▼ │
 ┌──────────┐
 │Search/Add│
 │Member    │
 │Kasih     │
 │Diskon?   │
 └────┬─────┘
      │
      └──────┐
             │
             ▼
    ┌─────────────────┐
    │ Pilih Pembayaran│
    │ [Cash] [Digital]│
    └────┬──────┬──────┘
         │      │
    CASH │      │ DIGITAL
         │      │
         ▼      ▼
    ┌─────┐  ┌──────┐
    │Hitung│  │Catat │
    │Kemb. │  │Bayar │
    └──┬──┘  └───┬──┘
       │         │
       └────┬────┘
            │
            ▼
    ┌──────────────────┐
    │ Transaksi Selesai│
    │ - Stok berkurang │
    │ - HPP tercatat   │
    │ - Struk digital  │
    └──────────────────┘

┌──────────────────────────────────────────────┐
│         ALUR MANAJEMEN STOK                  │
└──────────────────────────────────────────────┘

Buka Menu Stok
    │
    ▼
┌────────────────────┐
│ [Tambah Barang]    │
│ [Catat Pembelian]  │
│ [Lihat Stok]       │
└───┬────────┬───────┘
    │        │
    │        └──────────────┐
    ▼                       ▼
┌─────────────┐      ┌──────────────┐
│Tambah Barang│      │Catat Beli    │
│Baru         │      │Stok          │
│- Nama       │      │- Pilih Barang│
│- Harga Jual │      │- Qty Beli    │
│- Harga Beli │      │- Harga Beli  │
│- Stok Awal  │      └──────┬───────┘
│[Scan/Manual]│             │
└─────┬───────┘             │
      │                     │
      └──────┬──────────────┘
             │
             ▼
    ┌────────────────┐
    │ Data Tersimpan │
    │ (Untuk HPP)    │
    └────────────────┘

┌──────────────────────────────────────────────┐
│         ALUR LAPORAN KEUANGAN                │
└──────────────────────────────────────────────┘

Buka Laporan
    │
    ▼
┌───────────────────┐
│ Pilih Periode:    │
│ • Hari Ini        │
│ • Minggu Ini      │
│ • Bulan Ini       │
│ • Custom          │
└─────┬─────────────┘
      │
      ▼
┌────────────────────────┐
│ Hitung Otomatis:       │
│ ─────────────────────  │
│ Total Penjualan: XXX   │
│ HPP (otomatis): XXX    │
│ ─────────────────────  │
│ LABA KOTOR: XXX        │
│                        │
│ [Toggle Biaya Lain?]   │
└──────┬─────────────────┘
       │
       ▼
  ┌────────┐
  │ Tambah │
  │ Biaya? │
  └───┬──┬─┘
      │  │
   YA │  │ TIDAK
      │  │
      ▼  │
 ┌─────────┐
 │Input:   │
 │Listrik, │
 │Sewa,dll │
 └────┬────┘
      │
      └────┐
           │
           ▼
    ┌─────────────────┐
    │ LABA BERSIH:XXX │
    │ [Bagikan WA]    │
    │ [Simpan PDF]    │
    └─────────────────┘

┌──────────────────────────────────────────────┐
│         SISTEM HPP OTOMATIS                  │
└──────────────────────────────────────────────┘

Setiap Transaksi Jual
    │
    ▼
┌───────────────────────┐
│ Sistem Catat:         │
│ - Barang apa terjual  │
│ - Qty berapa          │
│ - Ambil harga beli    │
│   dari database       │
└──────┬────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Hitung HPP Transaksi:    │
│ HPP = Qty × Harga Beli   │
└──────┬───────────────────┘
       │
       ▼
┌───────────────────────────┐
│ Akumulasi untuk Laporan:  │
│ Total HPP = Σ HPP semua   │
│ transaksi dalam periode   │
└──────┬────────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Jika Stok Habis/        │
│ Akhir Bulan:             │
│ [Reminder Input Stok]    │
│ "Yuk input stok akhir    │
│  biar laporan akurat"    │
└──────────────────────────┘

┌──────────────────────────────────────────────┐
│         MODE HPP PENGGUNA                    │
└──────────────────────────────────────────────┘

          Mode HPP Dipilih Saat Setup
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│MODE SEDERHANA│        │MODE AKURAT   │
│              │        │              │
│HPP = Harga   │        │HPP = Harga   │
│Beli x Qty    │        │Beli x Qty    │
│              │        │              │
│Skip:         │        │Tambah:       │
│- Biaya sewa  │        │- Sewa        │
│- Listrik     │        │- Listrik     │
│- Gaji        │        │- Gaji        │
│              │        │- Overhead    │
│              │        │              │
│Cocok untuk:  │        │Cocok untuk:  │
│Warung kecil  │        │Ajukan modal  │
│              │        │ke bank       │
└──────────────┘        └──────────────┘
```

---

## **RINGKASAN KEY FEATURES**

| No | Fitur | Benefit untuk UMKM |
|----|-------|-------------------|
| 1 | **Kode Aktivasi** | Kontrol akses, tracking pengguna |
| 2 | **Onboarding Mudah** | Tidak butuh skill teknis |
| 3 | **Kasir Cepat** | Transaksi 3 langkah: pilih-qty-bayar |
| 4 | **Member Loyalty** | Jaga pelanggan setia tanpa ribet |
| 5 | **HPP Otomatis** | Tahu untung beneran tanpa hitung manual |
| 6 | **Laporan Fleksibel** | Sesuai kebutuhan (sederhana/akurat) |
| 7 | **Bahasa Sederhana** | Tidak pakai istilah akuntansi ribet |

---