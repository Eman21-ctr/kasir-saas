# DESAIN TAMPILAN APP - AKTIVASI & ONBOARDING

## 📱 SCREEN 1: SPLASH SCREEN (Loading Awal)

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│            [LOGO APP]               │
│                                     │
│          ═══════════                │
│              KasirKu             │
│          ═══════════                │
│                                     │
│       "Kasir Pintar untuk           │
│        UMKM"               │
│                                     │
│                                     │
│          ● ○ ○                      │
│        (Loading dots)               │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### 📝 Penjelasan Tampilan:
- **Background**: Gradient lembut dari `#10B981` (hijau emerald) ke `#059669` (hijau lebih gelap)
- **Logo**: Ilustrasi sederhana kasir/toko dengan style flat design, warna putih
- **Nama App**: Font Jakarta Sans Bold, 32px, warna putih (#FFFFFF)
- **Tagline**: Font Jakarta Sans Regular, 16px, warna putih dengan opacity 90%
- **Loading Indicator**: Dots animasi, warna putih
- **Icon**: Menggunakan Heroicons `building-storefront` untuk logo

---

## 📱 SCREEN 2: AKTIVASI KODE

```
┌─────────────────────────────────────┐
│  [←]                                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      [Icon Kunci]            │   │
│  │                              │   │
│  │    Selamat Datang! 👋        │   │
│  │                              │   │
│  │  Masukkan kode aktivasi      │   │
│  │  untuk mulai pakai app       │   │
│  │  kasir pintar ini            │   │
│  └─────────────────────────────┘   │
│                                     │
│  Kode Aktivasi                      │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  [  A  B  C  1  2  3  ]     │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Verifikasi Kode         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [Icon WA] Minta Kode Baru  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ℹ️  Kode ini diberikan oleh tim    │
│     kami atau partner UMKM          │
│     terdekatmu                      │
│                                     │
└─────────────────────────────────────┘
```

### 📝 Penjelasan Tampilan:

**Header:**
- Background: Putih (#FFFFFF)
- Icon back arrow: Heroicons `arrow-left`, warna `#6B7280` (gray-500), 24px
- Padding: 16px

**Card Welcome:**
- Background: Gradient `#DBEAFE` (blue-100) ke `#BFDBFE` (blue-200)
- Border radius: 16px
- Padding: 24px
- Icon: Heroicons `key` dengan warna `#3B82F6` (blue-500), 48px
- Judul "Selamat Datang!": Jakarta Sans Bold, 24px, `#1E293B` (slate-800)
- Emoji wave: Native emoji
- Deskripsi: Jakarta Sans Regular, 16px, `#475569` (slate-600), line-height 1.5

**Input Kode:**
- Label "Kode Aktivasi": Jakarta Sans Medium, 14px, `#334155` (slate-700)
- Input field: 
  - Background putih (#FFFFFF)
  - Border: 2px solid `#E2E8F0` (slate-200)
  - Border radius: 12px
  - Padding: 16px
  - Font: Jakarta Sans Bold, 20px, center-aligned, uppercase
  - Letter-spacing: 8px untuk tampilan kode yang jelas
  - Focus state: Border berubah jadi `#10B981` (emerald-500)
  - Height: 60px

**Tombol Verifikasi Kode:**
- Background: `#10B981` (emerald-500)
- Text: Jakarta Sans Bold, 16px, putih (#FFFFFF)
- Border radius: 12px
- Padding: 16px vertical
- Shadow: `0 4px 12px rgba(16, 185, 129, 0.25)`
- Hover/Press state: Background jadi `#059669` (emerald-600)
- Icon: Heroicons `check-circle` di sebelah kanan teks

**Tombol Minta Kode Baru:**
- Background: Putih (#FFFFFF)
- Border: 2px solid `#E5E7EB` (gray-200)
- Text: Jakarta Sans Semibold, 15px, `#10B981` (emerald-500)
- Border radius: 12px
- Padding: 14px vertical
- Icon WhatsApp: Heroicons `chat-bubble-left-right`, warna `#25D366` (WhatsApp green), 20px
- Margin top: 12px

**Info Text:**
- Icon: Heroicons `information-circle`, warna `#94A3B8` (slate-400), 16px
- Font: Jakarta Sans Regular, 13px
- Color: `#64748B` (slate-500)
- Background: `#F8FAFC` (slate-50)
- Border radius: 8px
- Padding: 12px
- Margin top: 24px

---

## 📱 SCREEN 3: ERROR KODE SALAH

```
┌─────────────────────────────────────┐
│  [←]                                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      [Icon Kunci]            │   │
│  │                              │   │
│  │    Selamat Datang! 👋        │   │
│  │                              │   │
│  │  Masukkan kode aktivasi      │   │
│  │  untuk mulai pakai app       │   │
│  │  kasir pintar ini            │   │
│  └─────────────────────────────┘   │
│                                     │
│  Kode Aktivasi                      │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  [  X  Y  Z  9  8  7  ]     │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ⚠️  Kode salah atau tidak   │   │
│  │     valid. Coba lagi ya!    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Coba Lagi               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [Icon WA] Hubungi Support  │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 📝 Penjelasan Tampilan:

**Alert Box Error:**
- Background: `#FEE2E2` (red-100)
- Border: 2px solid `#FCA5A5` (red-300)
- Border radius: 12px
- Padding: 16px
- Icon: Heroicons `exclamation-triangle`, warna `#DC2626` (red-600), 20px
- Text: Jakarta Sans Medium, 14px, `#991B1B` (red-800)
- Animasi: Slide down + shake gentle

**Input Field (Error State):**
- Border: 2px solid `#EF4444` (red-500)
- Background: `#FEF2F2` (red-50)
- Animasi: Shake horizontal 3x

**Tombol Coba Lagi:**
- Background: `#10B981` (emerald-500)
- Style sama seperti tombol verifikasi sebelumnya

**Tombol Hubungi Support:**
- Background: Putih (#FFFFFF)
- Border: 2px solid `#FCA5A5` (red-300)
- Text: Jakarta Sans Semibold, 15px, `#DC2626` (red-600)
- Icon: Heroicons `chat-bubble-left-right`, warna `#DC2626` (red-600)

---

## 📱 SCREEN 4: LOADING VERIFIKASI

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│         [Loading Spinner]           │
│                                     │
│      Memeriksa kode...              │
│                                     │
│       ━━━━━━━━━━                    │
│      (Progress bar)                 │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### 📝 Penjelasan Tampilan:

**Background:**
- Semi-transparent overlay: `rgba(0, 0, 0, 0.5)`
- Backdrop blur effect

**Loading Card:**
- Background: Putih (#FFFFFF)
- Border radius: 20px
- Padding: 40px
- Shadow: `0 20px 60px rgba(0, 0, 0, 0.3)`
- Width: 80% dari screen

**Spinner:**
- Heroicons `arrow-path` dengan animasi rotate
- Warna: `#10B981` (emerald-500)
- Size: 48px

**Text:**
- Font: Jakarta Sans Medium, 16px
- Color: `#475569` (slate-600)
- Margin top: 16px

**Progress Bar:**
- Height: 4px
- Background: `#E2E8F0` (slate-200)
- Fill: `#10B981` (emerald-500)
- Border radius: 4px
- Animasi: Indeterminate loading

---

## 📱 SCREEN 5: SUKSES - ONBOARDING STEP 1 (Profil Usaha)

```
┌─────────────────────────────────────┐
│                                     │
│  [✓] ━━━━ [ ] ━━━━ [ ]             │
│  Profil  Mode   Selesai             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   [Icon Toko]                │   │
│  │                              │   │
│  │  Cerita tentang usahamu      │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Nama Usaha *                       │
│  ┌─────────────────────────────┐   │
│  │ Warung Maju Jaya            │   │
│  └─────────────────────────────┘   │
│                                     │
│  Jenis Usaha *                      │
│  ┌─────────────────────────────┐   │
│  │ Pilih jenis usaha... [▼]   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Icon] Warung Sembako       │   │
│  ├─────────────────────────────┤   │
│  │ [Icon] Kedai Kopi           │   │
│  ├─────────────────────────────┤   │
│  │ [Icon] Warteg/Rumah Makan   │   │
│  ├─────────────────────────────┤   │
│  │ [Icon] Toko Kelontong       │   │
│  ├─────────────────────────────┤   │
│  │ [Icon] Lainnya              │   │
│  └─────────────────────────────┘   │
│                                     │
│           [Tombol: Lanjut →]        │
│                                     │
└─────────────────────────────────────┘
```

### 📝 Penjelasan Tampilan:

**Progress Stepper:**
- Background: `#F8FAFC` (slate-50)
- Height: 80px
- Padding: 16px

**Step Indicator:**
- Active step: 
  - Circle: Background `#10B981` (emerald-500), 32px diameter
  - Icon: Heroicons `check`, putih, 16px
  - Label: Jakarta Sans Semibold, 12px, `#10B981` (emerald-500)
- Inactive step:
  - Circle: Background `#E2E8F0` (slate-200), 32px diameter
  - Label: Jakarta Sans Regular, 12px, `#94A3B8` (slate-400)
- Line connector: 2px solid `#E2E8F0` (slate-200), width 40px

**Header Card:**
- Background: Gradient `#F0FDF4` (green-50) ke `#DCFCE7` (green-100)
- Border radius: 16px
- Padding: 24px
- Icon: Heroicons `building-storefront`, warna `#10B981` (emerald-500), 40px
- Heading: Jakarta Sans Bold, 20px, `#1E293B` (slate-800)

**Input Nama Usaha:**
- Label: Jakarta Sans Medium, 14px, `#334155` (slate-700)
- Asterisk required: Warna `#DC2626` (red-600)
- Input field:
  - Background: Putih (#FFFFFF)
  - Border: 2px solid `#E2E8F0` (slate-200)
  - Border radius: 12px
  - Padding: 14px
  - Font: Jakarta Sans Regular, 16px, `#1E293B` (slate-800)
  - Placeholder: `#94A3B8` (slate-400)
  - Focus: Border `#10B981` (emerald-500)

**Dropdown Jenis Usaha:**
- Initial state: Border 2px solid `#E2E8F0` (slate-200)
- Icon chevron: Heroicons `chevron-down`, warna `#6B7280` (gray-500)
- Expanded state: Shadow `0 8px 24px rgba(0, 0, 0, 0.12)`

**Dropdown Items:**
- Height per item: 56px
- Padding: 12px 16px
- Background putih, hover state: `#F0FDF4` (green-50)
- Icons untuk setiap jenis:
  - Warung Sembako: Heroicons `shopping-bag`
  - Kedai Kopi: Heroicons `cup`
  - Warteg: Heroicons `home`
  - Toko Kelontong: Heroicons `building-storefront`
  - Lainnya: Heroicons `ellipsis-horizontal-circle`
- Icon size: 24px, warna `#10B981` (emerald-500)
- Text: Jakarta Sans Medium, 15px, `#334155` (slate-700)
- Divider: 1px solid `#F1F5F9` (slate-100)

**Tombol Lanjut:**
- Background: `#10B981` (emerald-500)
- Text: Jakarta Sans Bold, 16px, putih
- Border radius: 12px
- Padding: 16px
- Icon: Heroicons `arrow-right`, 20px
- Position: Fixed bottom, margin 16px
- Shadow: `0 8px 16px rgba(16, 185, 129, 0.3)`
- Disabled state (jika form kosong): Background `#D1D5DB` (gray-300), no shadow

---

## 📱 SCREEN 6: ONBOARDING STEP 2 (Pilih Mode HPP)

```
┌─────────────────────────────────────┐
│                                     │
│  [✓] ━━━━ [✓] ━━━━ [ ]             │
│  Profil  Mode   Selesai             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   [Icon Calculator]          │   │
│  │                              │   │
│  │  Pilih cara hitung laba      │   │
│  │  yang cocok untukmu          │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ○  Mode Sederhana          │   │
│  │                              │   │
│  │  ✓ Cukup mudah, cepat        │   │
│  │  ✓ Skip biaya rumit          │   │
│  │  ✓ Fokus untung harian       │   │
│  │                              │   │
│  │  Cocok untuk: Warung kecil,  │   │
│  │  toko kelontong              │   │
│  │                              │   │
│  │      [Rekomendasikan! 🌟]    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ○  Mode Lebih Akurat       │   │
│  │                              │   │
│  │  ✓ Detail lengkap            │   │
│  │  ✓ Hitung semua biaya        │   │
│  │  ✓ Siap ajukan modal bank    │   │
│  │                              │   │
│  │  Cocok untuk: Mau ekspansi,  │   │
│  │  butuh laporan resmi         │   │
│  └─────────────────────────────┘   │
│                                     │
│           [Tombol: Lanjut →]        │
│                                     │
└─────────────────────────────────────┘
```

### 📝 Penjelasan Tampilan:

**Header Card:**
- Icon: Heroicons `calculator`, warna `#8B5CF6` (violet-500), 40px
- Background gradient: `#F5F3FF` (violet-50) ke `#EDE9FE` (violet-100)

**Card Mode Sederhana (Recommended):**
- Background: Putih (#FFFFFF)
- Border: 3px solid `#10B981` (emerald-500) - lebih tebal karena recommended
- Border radius: 16px
- Padding: 20px
- Shadow: `0 4px 16px rgba(16, 185, 129, 0.15)`

**Radio Button (Unchecked):**
- Heroicons `circle` outline, warna `#D1D5DB` (gray-300), 24px
- Checked state: Heroicons `check-circle` solid, warna `#10B981` (emerald-500)

**Title Mode:**
- Font: Jakarta Sans Bold, 18px, `#1E293B` (slate-800)
- Margin bottom: 12px

**Checklist Items:**
- Icon: Heroicons `check`, warna `#10B981` (emerald-500), 18px
- Text: Jakarta Sans Regular, 14px, `#475569` (slate-600)
- Spacing: 8px antar item
- Line height: 1.6

**Cocok untuk Section:**
- Background: `#F0FDF4` (green-50)
- Border radius: 8px
- Padding: 12px
- Font: Jakarta Sans Medium, 13px, `#059669` (emerald-700)
- Margin top: 16px

**Badge Rekomendasikan:**
- Background: Gradient `#FBBF24` (amber-400) ke `#F59E0B` (amber-500)
- Border radius: 20px (pill shape)
- Padding: 6px 16px
- Font: Jakarta Sans Bold, 12px, putih
- Emoji star: Native
- Position: Center aligned
- Margin top: 12px
- Shadow: `0 2px 8px rgba(251, 191, 36, 0.4)`

**Card Mode Akurat (Not Selected):**
- Background: Putih (#FFFFFF)
- Border: 2px solid `#E2E8F0` (slate-200)
- Border radius: 16px
- Padding: 20px
- No shadow (untuk bedain dengan yang selected)
- Hover state: Border jadi `#CBD5E1` (slate-300)

**Cocok untuk Section (Mode Akurat):**
- Background: `#EEF2FF` (indigo-50)
- Text color: `#4F46E5` (indigo-600)

**Interactive States:**
- Tap pada card → Border berubah, radio terselect, shadow muncul
- Smooth transition: 200ms ease-in-out

---

## 📱 SCREEN 7: ONBOARDING STEP 3 (Verifikasi Nomor HP)

```
┌─────────────────────────────────────┐
│                                     │
│  [✓] ━━━━ [✓] ━━━━ [✓]             │
│  Profil  Mode   Selesai             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   [Icon Phone]               │   │
│  │                              │   │
│  │  Langkah terakhir!           │   │
│  │  Verifikasi nomor HP-mu      │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Nomor HP (WhatsApp) *              │
│  ┌──┬──────────────────────────┐   │
│  │🇮🇩│ 081234567890             │   │
│  │+62│                          │   │
│  └──┴──────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📱 Kirim Kode OTP via WA   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ℹ️  Kode OTP akan dikirim ke       │
│     WhatsApp-mu untuk keamanan      │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### 📝 Penjelasan Tampilan:

**Header Card:**
- Icon: Heroicons `device-phone-mobile`, warna `#06B6D4` (cyan-500), 40px
- Background gradient: `#ECFEFF` (cyan-50) ke `#CFFAFE` (cyan-100)

**Input Nomor HP:**
- Container split 2 kolom:
  - Kolom 1 (Country code): Width 80px, background `#F8FAFC` (slate-50), center text
  - Kolom 2 (Phone number): Flex 1
- Flag emoji: 🇮🇩 native emoji, 24px
- Country code text: Jakarta Sans Medium, 14px, `#64748B` (slate-500)
- Divider vertical: 1px solid `#E2E8F0` (slate-200)
- Input field:
  - Type: tel (numeric keyboard on mobile)
  - Font: Jakarta Sans Regular, 16px
  - Placeholder: "contoh: 81234567890"
  - Auto-format dengan spasi setiap 4 digit
  - Border radius: 12px

**Tombol Kirim OTP:**
- Background: `#06B6D4` (cyan-500)
- Icon: Native emoji 📱 atau Heroicons `chat-bubble-oval-left`
- Text: Jakarta Sans Bold, 16px, putih
- Border radius: 12px
- Padding: 16px
- Shadow: `0 4px 12px rgba(6, 182, 212, 0.25)`
- Disabled state (jika nomor < 10 digit): Background `#D1D5DB` (gray-300)

**Info Box:**
- Similar style seperti screen 2
- Background: `#F0F9FF` (sky-50)
- Border left: 4px solid `#0EA5E9` (sky-500)
- Icon info color: `#0284C7` (sky-600)

---

## 📱 SCREEN 8: INPUT KODE OTP

```
┌─────────────────────────────────────┐
│  [←]                                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   [Icon Shield Check]        │   │
│  │                              │   │
│  │  Masukkan Kode OTP           │   │
│  │                              │   │
│  │  Kode dikirim ke WhatsApp:   │   │
│  │  +62 812-3456-7890           │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│                                     │
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐        │
│    │ 4 │ │ 7 │ │ 2 │ │ _ │        │
│    └───┘ └───┘ └───┘ └───┘        │
│                                     │
│                                     │
│  Tidak terima kode?                 │
│  [Kirim ulang dalam 00:45]          │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Verifikasi OTP          │   │
│  └─────────────────────────────┘   │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### 📝 Penjelasan Tampilan:

**Header Card:**
- Icon: Heroicons `shield-check`, warna `#10B981` (emerald-500), 40px
- Heading: Jakarta Sans Bold, 20px, `#1E293B` (slate-800)
- Subtext nomor: Jakarta Sans Regular, 14px, `#64748B` (slate-500)

**OTP Input Boxes:**
- 4 boxes terpisah (untuk 4 digit OTP)
- Setiap box:
  - Size: 64px × 64px
  - Background: Putih (#FFFFFF)
  - Border: 2px solid `#E2E8F0` (slate-200)
  - Border radius: 12px
  - Font: Jakarta Sans Bold, 32px, center-aligned
  - Color: `#1E293B` (slate-800)
  - Focus state: Border `#10B981` (emerald-500), scale 1.05
  - Filled state: Background `#F0FDF4` (green-50), border `#10B981` (emerald-500)
- Spacing antar box: 12px
- Auto-focus ke box berikutnya saat terisi
- Auto-submit saat semua terisi

**Resend Timer:**
- Text: Jakarta Sans Regular, 14px
- Color inactive: `#94A3B8` (slate-400)
- Color active (bisa klik): `#10B981` (emerald-500)
- Countdown timer: Jakarta Sans Semibold, 14px, `#DC2626` (red-600)
- Icon: Heroicons `arrow-path` saat bisa kirim ulang

**Tombol Verifikasi:**
- Style sama seperti tombol lanjut sebelumnya
- Auto-enable saat 4 digit terisi
- Loading state: Icon Heroicons `arrow-path` rotate + text "Memverifikasi..."

---

## 📱 SCREEN 9: SUKSES ONBOARDING

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         [Animasi Checkmark]         │
│              ✓                      │
│         (Animasi scale-in)          │
│                                     │
│                                     │
│       Selamat! Akun siap! 🎉       │
│                                     │
│    Warung Maju Jaya sudah           │
│    terdaftar di KasirKu             │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✓ Profil usaha tersimpan    │   │
│  │ ✓ Mode HPP: Sederhana       │   │
│  │ ✓ Nomor terverifikasi       │   │
│  └─────────────────────────────┘   │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Mulai Pakai Sekarang →   │   │
│  └─────────────────────────────┘   │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### 📝 Penjelasan Tampilan:

**Background:**
- Confetti animation overlay (optional, subtle)
- Background gradient: `#FFFFFF` ke `#F0FDF4` (green-50)

**Success Icon:**
- Heroicons `check-circle` solid
- Size: 120px
- Color: `#10B981` (emerald-500)
- Animasi: Scale dari 0 ke 1, bounce effect (300ms)
- Glow effect: `0 0 40px rgba(16, 185, 129, 0.4)`

**Heading Sukses:**
- Font: Jakarta Sans Bold, 26px
- Color: `#1E293B` (slate-800)
- Emoji celebrasi: Native emoji 🎉
- Margin top: 24px
- Text align: center

**Subheading Nama Usaha:**
- Font: Jakarta Sans Regular, 16px
- Color: `#64748B` (slate-500)
- Margin top: 8px
- Text align: center

**Summary Card:**
- Background: `#F0FDF4` (green-50)
-Border: 1px solid `#BBF7D0` (green-200)
- Border radius: 16px
- Padding: 20px
- Margin: 32px 16px

**Checklist Items:**
- Icon: Heroicons `check`, warna `#10B981` (emerald-500), 20px
- Font: Jakarta Sans Medium, 15px, `#334155` (slate-700)
- Spacing: 12px antar item
- Animasi: Fade-in satu per satu dengan delay 100ms

**Tombol Mulai:**
- Background: Gradient `#10B981` (emerald-500) ke `#059669` (emerald-600)
- Text: Jakarta Sans Bold, 18px, putih
- Border radius: 16px
- Padding: 18px
- Shadow: `0 8px 24px rgba(16, 185, 129, 0.35)`
- Icon: Heroicons `arrow-right`, 24px
- Animasi pulse gentle
- Position: Fixed bottom dengan safe area

---

## 🎨 DESIGN SYSTEM SUMMARY

### Color Palette:
```
Primary (Emerald):
- emerald-50:  #F0FDF4 - Backgrounds
- emerald-100: #DCFCE7 - Light backgrounds
- emerald-500: #10B981 - Primary actions
- emerald-600: #059669 - Hover states
- emerald-700: #047857 - Pressed states

Secondary (Slate):
- slate-50:  #F8FAFC - Subtle backgrounds
- slate-100: #F1F5F9 - Dividers
- slate-200: #E2E8F0 - Borders
- slate-400: #94A3B8 - Placeholders
- slate-500: #64748B - Secondary text
- slate-700: #334155 - Labels
- slate-800: #1E293B - Headings

Accent Colors:
- cyan-500:   #06B6D4 - Phone verification
- violet-500: #8B5CF6 - Calculator/HPP
- blue-500:   #3B82F6 - Info elements
- amber-500:  #F59E0B - Recommended badges

Status Colors:
- red-500:    #EF4444 - Errors
- red-100:    #FEE2E2 - Error backgrounds
- green-500:  #10B981 - Success
- yellow-500: #EAB308 - Warnings
```

### Typography (Jakarta Sans):
```
Headings:
- H1: Bold, 26px, slate-800
- H2: Bold, 20-24px, slate-800
- H3: Semibold, 18px, slate-700

Body:
- Regular: 16px, slate-600
- Medium: 15px, slate-700
- Small: 13-14px, slate-500

Labels:
- Medium, 14px, slate-700

Buttons:
- Bold/Semibold, 16-18px, white
```

### Spacing System:
```
- 4px   (0.25rem) - Tight spacing
- 8px   (0.5rem)  - Small gaps
- 12px  (0.75rem) - Medium gaps
- 16px  (1rem)    - Standard padding
- 20px  (1.25rem) - Card padding
- 24px  (1.5rem)  - Section spacing
- 32px  (2rem)    - Large spacing
```

### Border Radius:
```
- 8px  - Small elements (badges, info boxes)
- 12px - Inputs, buttons
- 16px - Cards
- 20px - Pills, large cards
```

### Shadows:
```
Small:  0 2px 8px rgba(0, 0, 0, 0.08)
Medium: 0 4px 16px rgba(0, 0, 0, 0.12)
Large:  0 8px 24px rgba(0, 0, 0, 0.15)
Colored: 0 4px 12px rgba(16, 185, 129, 0.25) - untuk tombol primary
```

### Icons (Heroicons - Outline style default):
- Navigation: 24px
- Illustrations: 40-48px
- In-line: 16-20px
- All icons menggunakan stroke-width: 2

---

# DESAIN TAMPILAN - MANAJEMEN BARANG & STOK

## 📱 SCREEN 10: DAFTAR BARANG (List View)

```
┌─────────────────────────────────────┐
│  ☰  Daftar Barang         [+ Tambah]│
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔍 Cari barang...           │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Semua] [Stok Habis] [Favorit]    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [📦] Indomie Goreng         │   │
│  │      Rp 3.500               │   │
│  │      Stok: 48 pcs    [...]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [📦] Aqua 600ml             │   │
│  │      Rp 4.000               │   │
│  │      Stok: 24 btl    [...]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [📦] Teh Botol Sosro        │   │
│  │      Rp 5.000               │   │
│  │      ⚠️ Stok: 3 btl   [...]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [📦] Rokok Sampoerna Mild   │   │
│  │      Rp 28.000              │   │
│  │      🔴 Stok Habis!   [...]  │   │
│  └─────────────────────────────┘   │
│                                     │
│                 132 barang          │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 11: TAMBAH BARANG BARU

```
┌─────────────────────────────────────┐
│  [←]  Tambah Barang Baru            │
│                                     │
│  Nama Barang *                      │
│  ┌─────────────────────────────┐   │
│  │ Indomie Goreng              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Kategori                           │
│  ┌─────────────────────────────┐   │
│  │ Makanan & Minuman     [▼]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌──────────────┬──────────────┐   │
│  │ Harga Beli * │ Harga Jual * │   │
│  │              │              │   │
│  │ Rp 2.800     │ Rp 3.500     │   │
│  └──────────────┴──────────────┘   │
│                                     │
│  💡 Untung per pcs: Rp 700 (25%)    │
│                                     │
│  Stok Awal                          │
│  ┌──────────────┬──────────────┐   │
│  │   Jumlah     │    Satuan    │   │
│  │              │              │   │
│  │     48       │  pcs   [▼]  │   │
│  └──────────────┴──────────────┘   │
│                                     │
│  □ Tambahkan ke favorit             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Scan Barcode] atau input   │   │
│  │      manual seperti ini     │   │
│  └─────────────────────────────┘   │
│                                     │
│           [Simpan Barang]           │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 12: SCAN BARCODE (Alternatif Input)

```
┌─────────────────────────────────────┐
│  [←]  Scan Barcode                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │    [CAMERA VIEW]            │   │
│  │                             │   │
│  │    ┌─────────────┐          │   │
│  │    │             │          │   │
│  │    │   [  |||  ] │          │   │
│  │    │   SCANNING  │          │   │
│  │    │             │          │   │
│  │    └─────────────┘          │   │
│  │                             │   │
│  │ Arahkan ke barcode barang   │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  💡 Tips:                    │   │
│  │  • Pastikan cahaya cukup    │   │
│  │  • Jaga jarak 10-20cm       │   │
│  │  • Barcode tidak terlipat   │   │
│  └─────────────────────────────┘   │
│                                     │
│       [Atau Ketik Manual]           │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 13: DETAIL BARANG (Tap Card dari List)

```
┌─────────────────────────────────────┐
│  [←]  Detail Barang        [Edit]   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        [Image/Icon]          │   │
│  │      Indomie Goreng          │   │
│  │                              │   │
│  │    ⭐⭐⭐ Favorit              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Informasi Harga                    │
│  ┌─────────────────────────────┐   │
│  │ Harga Beli:  Rp 2.800       │   │
│  │ Harga Jual:  Rp 3.500       │   │
│  │ Untung:      Rp 700 (25%)   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Stok Saat Ini                      │
│  ┌─────────────────────────────┐   │
│  │        48 pcs                │   │
│  │    ━━━━━━━━━━━━━━            │   │
│  │    Aman (>20 pcs)            │   │
│  └─────────────────────────────┘   │
│                                     │
│  Riwayat (7 hari terakhir)          │
│  ┌─────────────────────────────┐   │
│  │ Terjual: 156 pcs            │   │
│  │ Pembelian stok: 2x          │   │
│  │ Rata-rata/hari: 22 pcs      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    [+] Tambah Stok          │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Lihat Riwayat Lengkap]            │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 14: CATAT PEMBELIAN STOK BARU

```
┌─────────────────────────────────────┐
│  [←]  Tambah Stok                   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [Icon] Indomie Goreng       │   │
│  │        Stok sekarang: 48    │   │
│  └─────────────────────────────┘   │
│                                     │
│  Tanggal Beli                       │
│  ┌─────────────────────────────┐   │
│  │ 10 Jan 2026          [📅]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  Jumlah Beli *                      │
│  ┌─────────────────────────────┐   │
│  │  [−]      120      [+]      │   │
│  │          pcs                │   │
│  └─────────────────────────────┘   │
│                                     │
│  Harga Beli per pcs *               │
│  ┌─────────────────────────────┐   │
│  │  Rp 2.800                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Total Belanja:              │   │
│  │                             │   │
│  │    Rp 336.000               │   │
│  │                             │   │
│  │ 💡 Harga beli naik Rp 50    │   │
│  │    dari terakhir            │   │
│  └─────────────────────────────┘   │
│                                     │
│  Catatan (opsional)                 │
│  ┌─────────────────────────────┐   │
│  │ Beli di Toko Sinar Jaya     │   │
│  └─────────────────────────────┘   │
│                                     │
│           [Simpan Pembelian]        │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 15: BULK INPUT (Tambah Banyak Barang Sekaligus)

```
┌─────────────────────────────────────┐
│  [←]  Tambah Banyak Barang          │
│                                     │
│  Mode: [Excel] [Scan] [Manual]      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Barang ke-1                  │   │
│  │ Nama: Aqua 600ml            │   │
│  │ Beli: Rp 3.000 Jual: Rp 4.000│  │
│  │ Stok: 24 btl          [✓]   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Barang ke-2                  │   │
│  │ Nama: Teh Botol             │   │
│  │ Beli: Rp 3.500 Jual: Rp 5.000│  │
│  │ Stok: 12 btl          [✓]   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Barang ke-3                  │   │
│  │ Nama: _______________       │   │
│  │ Beli: _____ Jual: _____     │   │
│  │ Stok: _____ ___       [ ]   │   │
│  └─────────────────────────────┘   │
│                                     │
│        [+ Tambah Barang Lagi]       │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  Total: 2 barang siap disimpan      │
│                                     │
│           [Simpan Semua]            │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 16: STOK HABIS / REMINDER

```
┌─────────────────────────────────────┐
│  [←]  Peringatan Stok               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   ⚠️  3 Barang Perlu         │   │
│  │       Perhatian!             │   │
│  └─────────────────────────────┘   │
│                                     │
│  🔴 Stok Habis (2)                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Rokok Sampoerna Mild        │   │
│  │ Terakhir terjual: 2 jam lalu│   │
│  │                             │   │
│  │      [+ Tambah Stok]        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Kopi Kapal Api              │   │
│  │ Terakhir terjual: 5 jam lalu│   │
│  │                             │   │
│  │      [+ Tambah Stok]        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ⚠️ Stok Menipis (<5) - 1           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Teh Botol Sosro             │   │
│  │ Sisa: 3 btl                 │   │
│  │ Rata-rata terjual: 8/hari   │   │
│  │                             │   │
│  │      [+ Tambah Stok]        │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Tandai Semua Sudah Dibeli]        │
│                                     │
└─────────────────────────────────────┘
```

# DESAIN TAMPILAN - TRANSAKSI KASIR & MEMBER

## 📱 SCREEN 17: DASHBOARD KASIR (Halaman Utama Kasir)

```
┌─────────────────────────────────────┐
│  ☰  Kasir                    [👤]   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔍 Cari barang atau scan... │   │
│  │                       [📷]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ⭐ Favorit                         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │[📦]│ │[📦]│ │[📦]│ │[📦]│      │
│  │Indo│ │Aqua│ │Teh │ │Roko│      │
│  │mie │ │600 │ │Botl│ │k   │      │
│  │3.5K│ │4K  │ │5K  │ │28K │      │
│  └────┘ └────┘ └────┘ └────┘      │
│   →                                 │
│                                     │
│  Semua Kategori                     │
│  ┌─────────────────────────────┐   │
│  │ 🍜 Makanan & Minuman        │   │
│  ├─────────────────────────────┤   │
│  │ 🚬 Rokok                    │   │
│  ├─────────────────────────────┤   │
│  │ 🧴 Kebutuhan Rumah          │   │
│  ├─────────────────────────────┤   │
│  │ ⚡ Pulsa & Token             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  Keranjang: 0 item               │
│  Total: Rp 0                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 18: TAMBAH ITEM KE KERANJANG

```
┌─────────────────────────────────────┐
│  [←]  Tambah ke Keranjang           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     [Image Indomie]          │   │
│  │                              │   │
│  │   Indomie Goreng             │   │
│  │   Rp 3.500                   │   │
│  │   Stok: 48 pcs               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Jumlah                             │
│  ┌─────────────────────────────┐   │
│  │                              │   │
│  │   [−]      5       [+]       │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Sub Total:                  │   │
│  │                              │   │
│  │    Rp 17.500                 │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Catatan (opsional)                 │
│  ┌─────────────────────────────┐   │
│  │ Contoh: minta kuah extra    │   │
│  └─────────────────────────────┘   │
│                                     │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   [🛒] Masukkan Keranjang   │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 19: KERANJANG BELANJA (Ada Item)

```
┌─────────────────────────────────────┐
│  [←]  Keranjang (3)         [🗑️]   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Indomie Goreng         5x   │   │
│  │ Rp 3.500          Rp 17.500 │   │
│  │ [−] [+]                [×]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Aqua 600ml             2x   │   │
│  │ Rp 4.000           Rp 8.000 │   │
│  │ [−] [+]                [×]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Teh Botol Sosro        1x   │   │
│  │ Rp 5.000           Rp 5.000 │   │
│  │ [−] [+]                [×]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  [+ Tambah Barang Lagi]             │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 Member: Belum dipilih    │   │
│  │    [Pilih/Tambah Member]    │   │
│  └─────────────────────────────┘   │
│                                     │
│  Sub Total         Rp 30.500       │
│  Diskon Member     Rp 0            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  TOTAL             Rp 30.500       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Lanjut Bayar →         │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 20: PILIH/CARI MEMBER

```
┌─────────────────────────────────────┐
│  [←]  Pilih Member                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🔍 Cari nama atau HP...     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [+] Tambah Member Baru      │   │
│  └─────────────────────────────┘   │
│                                     │
│  Member Terdaftar (24)              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 Ibu Siti                 │   │
│  │    0812-3456-7890           │   │
│  │    💎 Gold • 47x transaksi  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 Pak Budi                 │   │
│  │    0813-9876-5432           │   │
│  │    ⭐ Silver • 23x transaksi │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 Mba Ani                  │   │
│  │    0821-1111-2222           │   │
│  │    🆕 Baru • 3x transaksi   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [ ] Lanjut Tanpa Member     │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 21: TAMBAH MEMBER BARU (Quick Add)

```
┌─────────────────────────────────────┐
│  [×]  Tambah Member Baru            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      [Icon User Plus]        │   │
│  │                              │   │
│  │  Daftar Member Baru          │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Nama Lengkap *                     │
│  ┌─────────────────────────────┐   │
│  │ Ibu Siti Aminah             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Nomor HP/WhatsApp *                │
│  ┌──┬──────────────────────────┐   │
│  │🇮🇩│ 0812-3456-7890           │   │
│  │+62│                          │   │
│  └──┴──────────────────────────┘   │
│                                     │
│  Alamat (opsional)                  │
│  ┌─────────────────────────────┐   │
│  │ Jl. Melati No. 15           │   │
│  └─────────────────────────────┘   │
│                                     │
│  Benefit Member                     │
│  ┌─────────────────────────────┐   │
│  │ ☑️ Diskon 5% setiap belanja  │   │
│  │ ☑️ Poin 1 per Rp 1.000       │   │
│  │ □ Promo khusus via WA       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Simpan & Gunakan Sekarang │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Simpan Saja]                      │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 22: KERANJANG DENGAN MEMBER (Ada Diskon)

```
┌─────────────────────────────────────┐
│  [←]  Keranjang (3)         [🗑️]   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Indomie Goreng         5x   │   │
│  │ Rp 3.500          Rp 17.500 │   │
│  │ [−] [+]                [×]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Aqua 600ml             2x   │   │
│  │ Rp 4.000           Rp 8.000 │   │
│  │ [−] [+]                [×]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Teh Botol Sosro        1x   │   │
│  │ Rp 5.000           Rp 5.000 │   │
│  │ [−] [+]                [×]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  [+ Tambah Barang Lagi]             │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 Ibu Siti (💎 Gold)       │   │
│  │    Diskon 5% aktif!    [×]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  Sub Total         Rp 30.500       │
│  Diskon 5%        -Rp 1.525        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  TOTAL             Rp 28.975       │
│                                     │
│  💡 +28 poin untuk Ibu Siti         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Lanjut Bayar →         │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 23: PILIH METODE PEMBAYARAN

```
┌─────────────────────────────────────┐
│  [←]  Pilih Pembayaran              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Total Belanja:              │   │
│  │                              │   │
│  │    Rp 28.975                 │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Pilih Metode Pembayaran            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  💵  Tunai / Cash            │   │
│  │                              │   │
│  │      Paling sering dipilih   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📱  QRIS                    │   │
│  │                              │   │
│  │      Scan untuk bayar        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  💳  Transfer Bank           │   │
│  │                              │   │
│  │      BCA, Mandiri, BRI       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🏪  E-Wallet                │   │
│  │                              │   │
│  │      GoPay, OVO, DANA, ShopeePay│
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📋  Bon/Hutang              │   │
│  │                              │   │
│  │      Bayar nanti (Member)    │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 24: BAYAR TUNAI (Hitung Kembalian)

```
┌─────────────────────────────────────┐
│  [←]  Pembayaran Tunai              │
│                                     │
│  Total Belanja                      │
│  ┌─────────────────────────────┐   │
│  │                              │   │
│  │      Rp 28.975               │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Uang Diterima                      │
│  ┌─────────────────────────────┐   │
│  │                              │   │
│  │   Rp 50.000                  │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Nominal Cepat                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │Pas │ │50K │ │100K│ │Custom│    │
│  │28K │ │    │ │    │ │     │     │
│  └────┘ └────┘ └────┘ └────┘      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Kembalian:                  │   │
│  │                              │   │
│  │    Rp 21.025                 │   │
│  │                              │   │
│  │  💡 Bulatkan jadi Rp 21.000? │   │
│  │     (Selisih masuk kas kecil)│   │
│  │                              │   │
│  │  [Ya, Bulatkan] [Tidak]      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   ✓ Selesaikan Transaksi    │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 25: BAYAR QRIS

```
┌─────────────────────────────────────┐
│  [←]  Pembayaran QRIS               │
│                                     │
│  Total Belanja                      │
│  ┌─────────────────────────────┐   │
│  │                              │   │
│  │      Rp 28.975               │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                              │   │
│  │    ┌─────────────────┐       │   │
│  │    │                 │       │   │
│  │    │   [QR CODE]     │       │   │
│  │    │                 │       │   │
│  │    │   SCAN DISINI   │       │   │
│  │    │                 │       │   │
│  │    └─────────────────┘       │   │
│  │                              │   │
│  │  Minta pembeli scan QR       │   │
│  │  dengan aplikasi:            │   │
│  │                              │   │
│  │  GoPay • OVO • DANA          │   │
│  │  ShopeePay • LinkAja         │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Status: Menunggu pembayaran...     │
│  ⏱️ 04:58                            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Sudah Dibayar? Konfirmasi  │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Batal & Ganti Metode]             │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 26: TRANSAKSI SUKSES

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         [Animasi Checkmark]         │
│              ✓                      │
│                                     │
│                                     │
│      Transaksi Berhasil! 🎉        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  No: #INV-20260110-0047     │   │
│  │                              │   │
│  │  Total:     Rp 28.975       │   │
│  │  Bayar:     Rp 50.000       │   │
│  │  Kembali:   Rp 21.000       │   │
│  │                              │   │
│  │  Member: Ibu Siti (+28 poin)│   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📄 Lihat Struk Digital     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📲 Kirim ke WA Customer    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🖨️ Cetak Struk (Bluetooth) │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Transaksi Baru →          │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Kembali ke Dashboard]             │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 27: STRUK DIGITAL

```
┌─────────────────────────────────────┐
│  [←]  Struk Digital         [Share] │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ═══════════════════════════  │   │
│  │     WARUNG MAJU JAYA         │   │
│  │ ═══════════════════════════  │   │
│  │                              │   │
│  │ Jl. Raya No. 123, Jakarta    │   │
│  │ WA: 0812-3456-7890           │   │
│  │                              │   │
│  │ ─────────────────────────────│   │
│  │                              │   │
│  │ No: #INV-20260110-0047       │   │
│  │ Tanggal: 10 Jan 2026, 14:32  │   │
│  │ Kasir: Admin                 │   │
│  │                              │   │
│  │ ─────────────────────────────│   │
│  │                              │   │
│  │ Indomie Goreng          5x   │   │
│  │ @ Rp 3.500        Rp 17.500  │   │
│  │                              │   │
│  │ Aqua 600ml              2x   │   │
│  │ @ Rp 4.000         Rp 8.000  │   │
│  │                              │   │
│  │ Teh Botol Sosro         1x   │   │
│  │ @ Rp 5.000         Rp 5.000  │   │
│  │                              │   │
│  │ ─────────────────────────────│   │
│  │                              │   │
│  │ Sub Total         Rp 30.500  │   │
│  │ Diskon Member 5%  -Rp 1.525  │   │
│  │                              │   │
│  │ TOTAL             Rp 28.975  │   │
│  │                              │   │
│  │ Bayar Tunai       Rp 50.000  │   │
│  │ Kembali           Rp 21.000  │   │
│  │                              │   │
│  │ ─────────────────────────────│   │
│  │                              │   │
│  │ Member: Ibu Siti (+28 poin)  │   │
│  │ Total Poin Sekarang: 275     │   │
│  │                              │   │
│  │ ═══════════════════════════  │   │
│  │   Terima kasih! Datang lagi  │   │
│  │ ═══════════════════════════  │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  [📲 Kirim ke WA] [🖨️ Cetak]       │
│                                     │
└─────────────────────────────────────┘
```

# DESAIN TAMPILAN - LAPORAN KEUANGAN & HPP

## 📱 SCREEN 28: DASHBOARD LAPORAN (Overview)

```
┌─────────────────────────────────────┐
│  ☰  Laporan Keuangan        [Filter]│
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📅 Hari Ini - 10 Jan 2026  │   │
│  │     [Ubah Periode ▼]        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  💰 Total Penjualan          │   │
│  │                              │   │
│  │     Rp 2.450.000             │   │
│  │     ↑ +15% dari kemarin      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📦 HPP (Harga Pokok)        │   │
│  │                              │   │
│  │     Rp 1.680.000             │   │
│  │     68.6% dari penjualan     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  💎 Laba Kotor               │   │
│  │                              │   │
│  │     Rp 770.000               │   │
│  │     31.4% margin             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  Quick Stats                        │
│  ┌──────────┬──────────┬─────────┐ │
│  │ 🧾       │ 👥       │ 📊      │ │
│  │ 47       │ 12       │ 156     │ │
│  │ Transaksi│ Member   │ Item    │ │
│  └──────────┴──────────┴─────────┘ │
│                                     │
│  [Lihat Laporan Detail →]           │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 29: PILIH PERIODE LAPORAN

```
┌─────────────────────────────────────┐
│  [←]  Pilih Periode                 │
│                                     │
│  Periode Cepat                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ● Hari Ini                  │   │
│  │    10 Jan 2026               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ○ Kemarin                   │   │
│  │    9 Jan 2026                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ○ Minggu Ini                │   │
│  │    6 - 12 Jan 2026           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ○ Bulan Ini                 │   │
│  │    Jan 2026                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ○ 7 Hari Terakhir           │   │
│  │    4 - 10 Jan 2026           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ○ 30 Hari Terakhir          │   │
│  │    11 Des 2025 - 10 Jan 2026 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📅 Custom/Pilih Tanggal     │   │
│  └─────────────────────────────┘   │
│                                     │
│           [Terapkan Filter]         │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 30: LAPORAN DETAIL (Mode Sederhana)

```
┌─────────────────────────────────────┐
│  [←]  Laporan Detail        [Share] │
│                                     │
│  📅 Hari Ini - 10 Jan 2026          │
│  Mode: Sederhana                    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  RINGKASAN KEUANGAN          │   │
│  │  ═══════════════════════════  │   │
│  │                              │   │
│  │  💰 Total Penjualan          │   │
│  │     Rp 2.450.000             │   │
│  │                              │   │
│  │  📦 HPP (Harga Pokok)        │   │
│  │     Rp 1.680.000             │   │
│  │     (Harga beli barang yang  │   │
│  │      sudah terjual)          │   │
│  │                              │   │
│  │  ─────────────────────────────│   │
│  │                              │   │
│  │  💎 LABA BERSIH              │   │
│  │     Rp 770.000               │   │
│  │                              │   │
│  │  📊 Margin: 31.4%            │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ℹ️  Apa itu HPP?             │   │
│  │                              │   │
│  │  HPP adalah total harga beli │   │
│  │  barang yang sudah terjual.  │   │
│  │                              │   │
│  │  Contoh: Jual Indomie 10 bungkus│
│  │  Harga jual: @3.500 = 35.000│   │
│  │  Harga beli: @2.800 = 28.000│   │
│  │  HPP = 28.000                │   │
│  │  Laba = 7.000 (20%)          │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Tambah Biaya Lain?]               │
│  [Lihat Rincian Penjualan]          │
│  [Export PDF/Excel]                 │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 31: TAMBAH BIAYA LAIN (Opsional)

```
┌─────────────────────────────────────┐
│  [←]  Biaya Operasional             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Mau hitung laba lebih       │   │
│  │  akurat? Tambahkan biaya     │   │
│  │  lain yang kamu keluarkan    │   │
│  └─────────────────────────────┘   │
│                                     │
│  Biaya Saat Ini                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ⚡ Listrik                   │   │
│  │    Rp 50.000 /bulan    [×]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🏠 Sewa Kios                 │   │
│  │    Rp 500.000 /bulan   [×]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [+] Tambah Biaya Baru        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  Untuk Periode: Hari Ini            │
│  Total Biaya Operasional:           │
│  Rp 18.333 (prorata harian)         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Laba Kotor:   Rp 770.000   │   │
│  │  Biaya:       -Rp  18.333   │   │
│  │  ───────────────────────────  │   │
│  │  LABA BERSIH:  Rp 751.667   │   │
│  └─────────────────────────────┘   │
│                                     │
│           [Simpan & Terapkan]       │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 32: FORM TAMBAH BIAYA BARU

```
┌─────────────────────────────────────┐
│  [×]  Tambah Biaya Baru             │
│                                     │
│  Nama Biaya *                       │
│  ┌─────────────────────────────┐   │
│  │ Gaji Karyawan               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Kategori                           │
│  ┌─────────────────────────────┐   │
│  │ Pilih kategori...     [▼]  │   │
│  └─────────────────────────────┘   │
│  • Listrik & Air                    │
│  • Sewa Tempat                      │
│  • Gaji/Upah                        │
│  • Transport & Bensin               │
│  • Lain-lain                        │
│                                     │
│  Nominal *                          │
│  ┌─────────────────────────────┐   │
│  │ Rp 1.200.000                │   │
│  └─────────────────────────────┘   │
│                                     │
│  Periode Pembayaran *               │
│  ┌─────────────────────────────┐   │
│  │ ○ Harian                    │   │
│  │ ● Bulanan                   │   │
│  │ ○ Sekali saja (one-time)    │   │
│  └─────────────────────────────┘   │
│                                     │
│  💡 Untuk perhitungan harian,       │
│     biaya bulanan akan dibagi 30    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        Simpan Biaya         │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 33: LAPORAN DETAIL (Mode Akurat)

```
┌─────────────────────────────────────┐
│  [←]  Laporan Detail        [Share] │
│                                     │
│  📅 Bulan Ini - Jan 2026            │
│  Mode: Lebih Akurat                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  LAPORAN LABA RUGI           │   │
│  │  ═══════════════════════════  │   │
│  │                              │   │
│  │  PENDAPATAN                  │   │
│  │  Penjualan        45.800.000 │   │
│  │                              │   │
│  │  HARGA POKOK PENJUALAN (HPP) │   │
│  │  Pembelian Barang 31.460.000 │   │
│  │                              │   │
│  │  LABA KOTOR       14.340.000 │   │
│  │  (Margin: 31.3%)             │   │
│  │  ─────────────────────────────│   │
│  │                              │   │
│  │  BIAYA OPERASIONAL           │   │
│  │  Listrik & Air       150.000 │   │
│  │  Sewa Kios           500.000 │   │
│  │  Gaji Karyawan     1.200.000 │   │
│  │  Transport           200.000 │   │
│  │  Lain-lain           100.000 │   │
│  │  Total Biaya       2.150.000 │   │
│  │  ─────────────────────────────│   │
│  │                              │   │
│  │  💎 LABA BERSIH              │   │
│  │     Rp 12.190.000            │   │
│  │                              │   │
│  │  📊 Net Margin: 26.6%        │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Edit Biaya] [Lihat Grafik]        │
│  [Export ke Excel]                  │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 34: GRAFIK PENJUALAN

```
┌─────────────────────────────────────┐
│  [←]  Grafik Penjualan              │
│                                     │
│  📊 7 Hari Terakhir                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Rp                           │   │
│  │ 3M │                         │   │
│  │    │           ●             │   │
│  │ 2M │       ●       ●         │   │
│  │    │   ●               ●     │   │
│  │ 1M │                       ● │   │
│  │    │                         │   │
│  │  0 └─────────────────────────│   │
│  │     S  S  R  K  J  S  M     │   │
│  │                              │   │
│  │  Rata-rata: Rp 2.1 juta/hari │   │
│  │  Tertinggi: Sen (Rp 2.8 jt) │   │
│  │  Terendah:  Min (Rp 1.2 jt) │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  💡 Insight                  │   │
│  │                              │   │
│  │  Penjualan paling ramai:     │   │
│  │  • Senin (hari gajian)       │   │
│  │  • Jumat (akhir pekan)       │   │
│  │                              │   │
│  │  Pertimbangkan stok lebih    │   │
│  │  banyak di hari-hari ini!    │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Ganti ke Grafik Laba]             │
│  [Lihat per Kategori]               │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 35: RINCIAN PENJUALAN PER ITEM

```
┌─────────────────────────────────────┐
│  [←]  Rincian Penjualan             │
│                                     │
│  📅 Hari Ini - 10 Jan 2026          │
│                                     │
│  Urutkan: [Terlaris ▼]              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 1. Indomie Goreng            │   │
│  │    ───────────────────────    │   │
│  │    Terjual: 156 pcs          │   │
│  │    Penjualan: Rp 546.000     │   │
│  │    HPP: Rp 436.800           │   │
│  │    Laba: Rp 109.200 (20%)    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 2. Rokok Sampoerna Mild      │   │
│  │    ───────────────────────    │   │
│  │    Terjual: 24 bks           │   │
│  │    Penjualan: Rp 672.000     │   │
│  │    HPP: Rp 600.000           │   │
│  │    Laba: Rp 72.000 (10.7%)   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 3. Aqua 600ml                │   │
│  │    ───────────────────────    │   │
│  │    Terjual: 88 btl           │   │
│  │    Penjualan: Rp 352.000     │   │
│  │    HPP: Rp 264.000           │   │
│  │    Laba: Rp 88.000 (25%)     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 4. Teh Botol Sosro           │   │
│  │    ───────────────────────    │   │
│  │    Terjual: 62 btl           │   │
│  │    Penjualan: Rp 310.000     │   │
│  │    HPP: Rp 217.000           │   │
│  │    Laba: Rp 93.000 (30%)     │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Lihat Semua (24 item)]            │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 36: MODE SITUASI KHUSUS

```
┌─────────────────────────────────────┐
│  [←]  Mode Situasi Khusus           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Sesuaikan laporan dengan    │   │
│  │  kondisi khusus bisnismu     │   │
│  └─────────────────────────────┘   │
│                                     │
│  Pilih Mode (opsional)              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🌧️ Mode Musim Hujan         │   │
│  │                              │   │
│  │  • Penjualan menurun         │   │
│  │  • Biaya transport naik      │   │
│  │  • Stok tahan lebih lama     │   │
│  │                              │   │
│  │  [Terapkan]                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🌙 Mode Ramadan/Lebaran     │   │
│  │                              │   │
│  │  • Penjualan meningkat       │   │
│  │  • Stok harus lebih banyak   │   │
│  │  • Margin bisa lebih kecil   │   │
│  │                              │   │
│  │  [Terapkan]                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  💰 Mode Ajukan Pinjaman     │   │
│  │                              │   │
│  │  • Laporan lebih detail      │   │
│  │  • Semua biaya tercatat      │   │
│  │  • Format untuk bank         │   │
│  │                              │   │
│  │  [Terapkan]                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Mode Normal (Default)]            │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 37: REMINDER INPUT STOK AKHIR

```
┌─────────────────────────────────────┐
│                                     │
│  ┌─────────────────────────────┐   │
│  │      [Icon Calendar]         │   │
│  │                              │   │
│  │  Waktunya Cek Stok! 📦       │   │
│  │                              │   │
│  │  Yuk input stok akhir bulan  │   │
│  │  ini biar laporan HPP lebih  │   │
│  │  akurat                      │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Kenapa penting?                    │
│  ┌─────────────────────────────┐   │
│  │  ✓ HPP jadi lebih akurat    │   │
│  │  ✓ Tahu barang mana yang    │   │
│  │    sering hilang/rusak      │   │
│  │  ✓ Laporan untuk bank lebih │   │
│  │    dipercaya                │   │
│  └─────────────────────────────┘   │
│                                     │
│  Barang yang Perlu Dicek (12)       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Indomie Goreng              │   │
│  │ Stok sistem: 48 pcs         │   │
│  │ Stok fisik: [___] pcs       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Aqua 600ml                  │   │
│  │ Stok sistem: 24 btl         │   │
│  │ Stok fisik: [___] btl       │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Input Semua Stok]                 │
│  [Ingatkan Besok]                   │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 SCREEN 38: EXPORT & SHARE LAPORAN

```
┌─────────────────────────────────────┐
│  [←]  Bagikan Laporan               │
│                                     │
│  📅 Laporan: Jan 2026               │
│                                     │
│  Format File                        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📄 PDF                      │   │
│  │     Cocok untuk: Print, Email│   │
│  │     Ukuran: ~250 KB          │   │
│  │                              │   │
│  │     [Pilih PDF]              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📊 Excel (XLSX)             │   │
│  │     Cocok untuk: Editing,    │   │
│  │     Analisis lebih lanjut    │   │
│  │     Ukuran: ~85 KB           │   │
│  │                              │   │
│  │     [Pilih Excel]            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📱 Gambar (PNG)             │   │
│  │     Cocok untuk: WhatsApp,   │   │
│  │     Social Media             │   │
│  │     Ukuran: ~180 KB          │   │
│  │                              │   │
│  │     [Pilih Gambar]           │   │
│  └─────────────────────────────┘   │
│                                     │
│  Kirim Langsung                     │
│  ┌──────────┬──────────┬─────────┐ │
│  │ [WA]     │ [Email]  │ [Print] │ │
│  │ WhatsApp │ Email    │ Cetak   │ │
│  └──────────┴──────────┴─────────┘ │
│                                     │
└─────────────────────────────────────┘
```

