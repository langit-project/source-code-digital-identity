# Dokumentasi Teknis: Prototipe SIPSI AI Blockchain

## **Ikhtisar Proyek**
Proyek ini merupakan peningkatan teknologi tingkat tinggi dari sistem **SIPSI** yang digunakan oleh Komisi Informasi Pusat. Proyek ini mentransformasi sistem manajemen hukum tradisional menjadi platform terdesentralisasi yang didukung AI, guna menjamin integritas data dan privasi partisipan.

---

## **Tech Stack**

### **AI & Machine Learning**
- **Framework:** Flask (Python 3.8), Transformers (Hugging Face), TensorFlow
- **Model:** 
  - **BERT (IndoBERT):** Digunakan untuk **proses verifikasi** melalui Named Entity Recognition (NER) guna mengekstraksi dan memvalidasi identitas (Pemohon/Termohon).
  - **RoBERTa:** Digunakan untuk **fitur rekomendasi** klasifikasi informasi publik berdasarkan kategori yang diatur dalam UU KIP.
- **Infrastruktur:** Layanan inferensi berbasis Docker

### **Blockchain & Smart Contracts**
- **Jaringan:** Polygon (Mainnet/Amoy)
- **Bahasa:** Solidity (0.8.x)
- **Tooling Pengembangan:** Hardhat, Viem, TypeScript
- **Penyimpanan:** IPFS (melalui Pinata)

### **Privasi & Kriptografi (ZKP)**
- **Framework ZKP:** Circom, SnarkJS (Groth16)
- **Struktur Data:** Merkle Tree untuk verifikasi keanggotaan identitas yang efisien
- **Verifikasi:** On-chain EVM Verifiers

---

## **Ikhtisar Arsitektur**
Prototipe ini menggunakan arsitektur berbasis layanan (service-oriented) yang terpisah:

1.  **Layanan AI (`sipsi-api-ai`)**: API independen yang mengolah dokumen hukum menggunakan model **BERT** untuk verifikasi entitas dan model **RoBERTa** untuk memberikan rekomendasi klasifikasi pasal/kategori informasi secara otomatis.
2.  **Middleware Blockchain (`sengketa-backend`)**: API Node.js yang mengelola interaksi dengan jaringan Polygon dan menangani unggahan file ke IPFS.
3.  **Layanan Identitas ZKP (`zkp-identity-backend`)**: Mengelola identitas pengguna, membangun Merkle Tree, dan menghasilkan bukti Zero-Knowledge untuk autentikasi privat.
4.  **Lapisan Smart Contract**:
    - `SengketaContract.sol`: Logika untuk validasi sengketa, persidangan, dan putusan.
    - `IdentityMerkleZKP.sol`: Verifikasi on-chain untuk bukti identitas (identity proofs).

---

## **Penjelasan Struktur Folder**

### **Modul Inti**
- **`/sengketa-backend`**: REST API untuk integrasi blockchain. Berisi kontroler untuk manajemen siklus hidup sengketa.
- **`/sengketa-cotract-main`**: Proyek Hardhat untuk smart contract Sengketa. Mencakup skrip deployment dan ABI kontrak.
- **`/sipsi-api-ai`**: Layanan AI berbasis Python. Mencakup model BERT dan RoBERTa yang telah dilatih serta konfigurasi Docker.
- **`/zkp-identity-backend`**: Layanan Node.js untuk mengelola data identitas, Merkle root, dan pembuatan bukti.
- **`/zkp-identity-proof`**: "Laboratorium Kriptografi". Berisi file sirkuit `.circom`, file `.zkey`, dan kontrak verifikasi.

### **Sistem Dasar**
- **`/sipsi-base`**: (Hanya Referensi) Sistem SIPSI asli berbasis Laravel.

---

## **Fitur Utama**

- **Ekstraksi Entitas Otomatis**: AI secara otomatis mengidentifikasi pihak-pihak kunci dan tanggal dalam dokumen hukum, mengurangi kesalahan entri data manual.
- **Buku Besar Sengketa Immutable**: Setiap tahap sengketa (Menerima, Validasi, Sidang, Putusan) dicatat secara on-chain dengan stempel waktu dan tanda tangan kriptografis.
- **Penyimpanan Bukti Aman**: Dokumen disimpan di IPFS, dengan hash unik (CID) yang ditautkan ke blockchain untuk mencegah manipulasi.
- **Verifikasi Identitas Privat**: Pengguna dapat membuktikan bahwa mereka adalah partisipan sah dalam suatu kasus tanpa mengungkapkan identitas lengkap mereka, menggunakan ZKP dan bukti inklusi Merkle Tree.

---

## **Lingkungan & Konfigurasi**
Setiap modul memiliki file `.env.example`. Konfigurasi utama meliputi:
- `SMART_CONTRACT_ADDRESS`: Alamat smart contract Sengketa yang dideploy.
- `POLYGON_MAINNET_RPC`: Koneksi ke jaringan blockchain.
- `PINATA_JWT`: Kredensial untuk penyimpanan IPFS.
- `ZKP_BACKEND_URL`: Endpoint untuk layanan verifikasi identitas.

---

## **Cara Menjalankan**
Silakan merujuk pada file `README.md` di dalam setiap subfolder spesifik untuk langkah instalasi dan deployment detail. Secara umum:
1.  **Kontrak**: Deploy menggunakan Hardhat.
2.  **AI**: Jalankan melalui Docker Compose.
3.  **Backend**: Jalankan menggunakan `npm start` atau `npm run dev`.