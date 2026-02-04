# Peningkatan Prototipe SIPSI: Ikhtisar Struktur

Repositori ini berisi prototipe peningkatan sistem **SIPSI** (Sistem Informasi Penyelesaian Sengketa Informasi) dari Komisi Informasi Pusat Republik Indonesia. Proyek ini memperluas kapabilitas sistem asli dengan mengintegrasikan teknologi mutakhir untuk meningkatkan transparansi, keamanan, dan otomatisasi.

## **Teknologi Inti**
Prototipe ini memperkenalkan empat pilar teknologi utama:
- **Kecerdasan Buatan (AI):** Mengotomatiskan analisis dokumen hukum melalui model **BERT** untuk proses verifikasi entitas dan **RoBERTa** untuk fitur rekomendasi klasifikasi informasi.
- **Blockchain:** Menyediakan jejak audit yang tidak dapat diubah (immutable) untuk resolusi sengketa.
- **Merkle Tree:** Menjamin integritas data yang efisien dan verifikasi keanggotaan data.
- **Zero-Knowledge Proof (ZKP):** Memungkinkan verifikasi identitas yang menjaga privasi pengguna.

## **Organisasi Sistem**
Repositori ini disusun sebagai ekosistem modular di mana setiap direktori merepresentasikan layanan khusus:
- **`sengketa-backend`**: Gerbang penghubung antara aplikasi dan jaringan blockchain.
- **`sengketa-cotract-main`**: Logika on-chain yang mengatur proses resolusi sengketa.
- **`sipsi-api-ai`**: Mesin AI yang mengimplementasikan model **BERT** (untuk verifikasi identitas/NER) dan **RoBERTa** (untuk fitur rekomendasi kategori informasi publik).
- **`zkp-identity-backend`**: Layanan pengelolaan verifikasi identitas melalui ZKP dan Merkle Tree.
- **`zkp-identity-proof`**: Inti kriptografi yang berisi sirkuit ZKP dan logika pembuatan bukti (proof generation).
- **`Raw Transaction Data`**: Data transaksi mentah (CSV) untuk keperluan audit dan transparansi data blockchain.

## **Konteks Sistem Warisan**
Direktori `sipsi-base` berisi sistem asli (legacy) yang digunakan sebagai fondasi fungsional. Direktori ini disertakan hanya untuk konteks arsitektur, namun **bukan** merupakan bagian dari implementasi prototipe baru dan akan dikecualikan dari rilis publik sistem yang telah ditingkatkan ini.