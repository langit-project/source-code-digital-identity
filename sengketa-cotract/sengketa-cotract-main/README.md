# 🧾 Smart Contract — Sengketa

---

## ⚙️ Persiapan Environment

1. Ganti nama file `.env.example` menjadi `.env`, dan isi dengan variabel berikut:

```
PRIVATE_KEY=0x...
POLYGON_MAINNET_RPC=https://polygon-mainnet.public.blastapi.io
POLYGONSCAN_API_KEY=your_POLYGONSCAN_API_KEY
```

📎 Dapatkan API Key Polygon di: [https://polygonscan.com/](https://polygonscan.com/)

---

## 🔨 Kompilasi & Pengujian Lokal

```bash
npx hardhat compile
npx hardhat test
```

---

## 🚀 Deploy ke Polygon Mainnet

Gunakan Hardhat Ignition untuk melakukan deploy pada polygon mainnet:

```bash
npx hardhat ignition deploy ignition/modules/SengketaContract.js --network polygonMainnet
```

> Jika ingin deploy ulang, hapus folder `ignition/deployments/` terlebih dahulu.

```bash
rm -rf ignition/deployments/
```

> Jika error saat deploy, coba ganti RPC URL di .env. Dapat diambil dari :[ChainList](https://chainlist.org/chain/137)

Smart Contract Terbaru:
0x34EE74C8FD0Eb8aeDA39b91fB66c6600a61cb9Cb

---

## 🔍 Verifikasi Kontrak

```bash
npx hardhat verify --network polygonMainnet alamat-kontrak "parameter_1" "parameter_2" "parameter_3"
```

Contoh:

```bash
npx hardhat verify --network polygonMainnet 0x34EE74C8FD0Eb8aeDA39b91fB66c6600a61cb9Cb "0x1082f6bF761FCe2B585A87a7E787123aD3D5F8a3" "0x1082f6bF761FCe2B585A87a7E787123aD3D5F8a3"  "0x1082f6bF761FCe2B585A87a7E787123aD3D5F8a3"
```

---

## 🌐 Eksplorasi di Testnet

Lihat kontrak yang telah dideploy di Polygon Amoy:
[Polygon Scan](https://polygonscan.com/address/0x34EE74C8FD0Eb8aeDA39b91fB66c6600a61cb9Cb)

---
