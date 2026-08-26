# Apex Industries - Offline Mobile Quotation App (PWA)

A mobile-first, offline-capable Progressive Web App (PWA) designed for **Apex Industries, Sangli** to create, customize, save, print, and share official industrial automation quotations in under 2 minutes.

---

## 🌟 Key Features

1. **Mobile-First Touch Ergonomics**:
   - Built specifically for one-handed smartphone use.
   - Large input fields, buttons, and high-contrast typography.
   - Step-by-step 5-step wizard (Customer ➔ Quotation Info ➔ Line Items ➔ Commercial Terms & Tax ➔ Export/Share).

2. **Pixel-Perfect Quotation Template**:
   - Replicates the exact physical quotation layout of **Apex Industries** (E-9, MIDC Kupwad, Sangli).
   - Includes Company Header, GSTN, Q. No., Ref No., Line Items Grid, Terms (Warranty, Packing, Freight, Payment, Validity, Delivery), and Official Stamp & Signature for **Mr. Dilip Mulay**.

3. **Dual Print & Generation Modes**:
   - **Complete Digital Sheet**: Generates high-definition vector A4 PDF with company header, grid borders, terms, and stamp seal.
   - **Pre-printed Stationary Overlay**: Prints only the text at precise millimeter coordinates for feeding existing printed quotation paper into office printers.

4. **Visual Drag-and-Drop Template Editor**:
   - Visual coordinate & layout customizer with real-time zooming (50% to 150%) and live PDF preview.
   - Drag placeholders or fine-tune X/Y coordinates in 0.5mm increments, adjust font sizes, boldness, and alignment.
   - Saved configurations persist locally and are automatically reused for all future quotations.

5. **100% Offline with Local IndexedDB**:
   - Complete offline functionality via Service Worker caching (Workbox).
   - Full CRUD support for Quotations and Customers using Dexie.js.
   - Auto-incrementing Quotation Number suggestions (`Q-101`, `Q-102`, etc.).
   - Full JSON Database Backup & Restore feature.

6. **Instant Export & Sharing**:
   - Direct **WhatsApp Sharing** (sends PDF file directly via Web Share API with instant fallback text summary).
   - Instant PDF download and direct printer dialog (`window.print`).

---

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with mobile safe-area insets
- **Offline Database**: IndexedDB via Dexie.js
- **PDF Engine**: High-Precision Vector jsPDF
- **PWA & Caching**: `vite-plugin-pwa` with Workbox Service Worker
- **Icons**: Lucide React

---

## 🚀 Quick Start & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## 📱 How to Install on Android / Mobile

1. Open the app URL in Google Chrome on your smartphone.
2. Tap the **"Install"** button in the top navigation bar (or open Chrome menu ⋮ ➔ **"Install app"** / **"Add to Home Screen"**).
3. The app is now installed on your home screen and operates **100% offline without internet connection**.
