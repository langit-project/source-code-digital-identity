import express from 'express';
import multer from 'multer';
import { ContractController } from '../controllers/contract-controller';
import { addFileToIPFS, getFileFromIPFS } from '../controllers/ipfs-controller';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/menerima-sengketa', ContractController.menerimaSengketa);
router.post('/validasi-sengketa', ContractController.validasiSengketa);
router.post('/pembuatan-jadwal-sidang-awal', ContractController.pembuatanJadwalSidangAwal);
router.post('/tambah-sidang', ContractController.tambahSidang);
router.post('/tambah-putusan', upload.single('cid'), ContractController.tambahPutusan);
router.post('/putusan-selesai', upload.single('cid'), ContractController.putusanSelesai);
router.post('/konfirmasi-batal-sengketa', upload.single('cid'), ContractController.batalSengketa);
router.post('/konfirmasi-cabut-sengketa', upload.single('cid'), ContractController.cabutSengketa);

router.post('/get-pemohon-termohon', ContractController.getPemohonTermohon);
router.post('/get-sidang', ContractController.getSidang);
router.post('/get-dokumen', ContractController.getDokumen);
router.post('/get-dokumen-batal-cabut', ContractController.getDokumenBatalCabut);
router.post('/get-jdih', ContractController.getJDIH);
router.post('/get-skpd', ContractController.getSKPD);

export default router;