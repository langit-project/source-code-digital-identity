import { Request, Response, NextFunction } from "express";
import { ContractService } from "../services/contract-service";
import {
  MenerimaSengketa,
  ValidasiSengketa,
  PembuatanSidangAwal,
  TambahSidang,
  TambahPutusan,
  RequestBatalCabut,
  InputIdSengketa,
  InputIdSengketaJadwal,
  StructCid,
} from "../models/contract-model";
import { Client } from "../services/ipfs-service";

export class ContractController {
  /**
   * @swagger
   * /contracts/menerima-sengketa:
   *   post:
   *     summary: Menerima Sengketa
   *     tags: [Contracts]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/MenerimaSengketa'
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ContractResponse'
   *       400:
   *         description: Bad request
   */
  static async menerimaSengketa(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const request: MenerimaSengketa = req.body as MenerimaSengketa;
      const response = await ContractService.menerimaSengketa(request);
      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /contracts/validasi-sengketa:
   *   post:
   *     summary: Validasi Sengketa
   *     tags: [Contracts]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ValidasiSengketa'
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ContractResponse'
   *       400:
   *         description: Bad request
   */
  static async validasiSengketa(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const request: ValidasiSengketa = req.body as ValidasiSengketa;
      const response = await ContractService.validasiSengketa(request);
      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /contracts/pembuatan-jadwal-sidang-awal:
   *   post:
   *     summary: Pembuatan Jadwal Sidang Awal
   *     tags: [Contracts]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PembuatanSidangAwal'
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ContractResponse'
   *       400:
   *         description: Bad request
   */
  static async pembuatanJadwalSidangAwal(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const request: PembuatanSidangAwal = req.body as PembuatanSidangAwal;
      const response = await ContractService.pembuatanJadwalSidangAwal(request);
      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /contracts/tambah-sidang:
   *   post:
   *     summary: Tambah Sidang
   *     tags: [Contracts]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TambahSidang'
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ContractResponse'
   *       400:
   *         description: Bad request
   */
  static async tambahSidang(req: Request, res: Response, next: NextFunction) {
    try {
      const request: TambahSidang = req.body as TambahSidang;
      const response = await ContractService.tambahSidang(request);
      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /contracts/tambah-putusan:
   *   post:
   *     summary: Tambah Putusan
   *     tags: [Contracts]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               idSengketa:
   *                 type: string
   *               idJadwal:
   *                 type: string
   *               statusPutusan:
   *                 type: string
   *               cid:
   *                 type: string
   *                 format: binary
   *                 description: PDF file (optional)
   *               jdih:
   *                 type: string
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ContractResponse'
   *       400:
   *         description: Bad request
   */
  static async tambahPutusan(req: Request, res: Response, next: NextFunction) {
    try {
      const { idSengketa, idJadwal, statusPutusan, jdih } = req.body;
      const cid = req.file; // `cid` is the file uploaded

      const request: TambahPutusan = {
        idSengketa,
        idJadwal,
        statusPutusan,
        cid,
        jdih,
      };
      const response = await ContractService.tambahPutusan(request);
      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /contracts/putusan-selesai:
   *   post:
   *     summary: Putusan Selesai
   *     tags: [Contracts]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               idSengketa:
   *                 type: string
   *               idJadwal:
   *                 type: string
   *               statusPutusan:
   *                 type: string
   *               cid:
   *                 type: string
   *                 format: binary
   *                 description: PDF file (optional)
   *               jdih:
   *                 type: string
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ContractResponse'
   *       400:
   *         description: Bad request
   */
  static async putusanSelesai(req: Request, res: Response, next: NextFunction) {
    try {
      const { idSengketa, idJadwal, statusPutusan, jdih } = req.body;
      const cid = req.file; // `cid` is the file uploaded

      const request: TambahPutusan = {
        idSengketa,
        idJadwal,
        statusPutusan,
        cid,
        jdih,
      };
      const response = await ContractService.putusanSelesai(request);
      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
  // TODO: add batal cabut dan pisahkan kedua endpoint
  /**
   * @swagger
   * /contracts/konfirmasi-batal-sengketa:
   *   post:
   *     summary: Membatalkan Sengketa
   *     tags: [Contracts]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               idSengketa:
   *                 type: string
   *               cid:
   *                 type: string
   *                 format: binary
   *                 description: PDF file (optional)
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ContractResponse'
   *       400:
   *         description: Bad request
   */
  static async batalSengketa(req: Request, res: Response, next: NextFunction) {
    try {
      const request: RequestBatalCabut = {
        idSengketa: req.body.idSengketa,
        cid: req.file,
      };
      const response = await ContractService.batalSengketa(request);
      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /contracts/konfirmasi-cabut-sengketa:
   *   post:
   *     summary: Membatal atau mencabut Sengketa
   *     tags: [Contracts]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               idSengketa:
   *                 type: string
   *               cid:
   *                 type: string
   *                 format: binary
   *                 description: PDF file (optional)
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ContractResponse'
   *       400:
   *         description: Bad request
   */
  static async cabutSengketa(req: Request, res: Response, next: NextFunction) {
    try {
      const request: RequestBatalCabut = {
        idSengketa: req.body.idSengketa,
        cid: req.file,
      };
      const response = await ContractService.cabutSengketa(request);
      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * components:
   *   schemas:
   *     InputIdSengketa:
   *       type: object
   *       properties:
   *         idSengketa:
   *           type: string
   *     InputIdSengketaJadwal:
   *       type: object
   *       properties:
   *         idSengketa:
   *           type: string
   *         idJadwal:
   *           type: string
   *     StructSengketa:
   *       type: object
   *       properties:
   *         pemohon:
   *           type: string
   *         termohon:
   *           type: string
   *     StructSidang:
   *       type: object
   *       properties:
   *         jenis:
   *           type: string
   *         agenda:
   *           type: string
   *         tanggal:
   *           type: string
   *         alamat:
   *           type: string
   *     StructSKPD:
   *       type: object
   *       properties:
   *         jumlah:
   *           type: string
   *         skpd:
   *           type: array
   *           items:
   *             type: string
   */

  /**
   * @swagger
   * /contracts/get-pemohon-Termohon:
   *   post:
   *     summary: Get Pemohon and Termohon
   *     tags: [Get Data]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InputIdSengketa'
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StructSengketa'
   *       500:
   *         description: Server error
   */
  static async getPemohonTermohon(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const request: InputIdSengketa = req.body as InputIdSengketa;
      const result = await ContractService.getPemohonTermohon(request);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /contracts/get-sidang:
   *   post:
   *     summary: Get Sidang details
   *     tags: [Get Data]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InputIdSengketaJadwal'
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StructSidang'
   *       500:
   *         description: Server error
   */
  static async getSidang(req: Request, res: Response, next: NextFunction) {
    try {
      const request: InputIdSengketaJadwal = req.body as InputIdSengketaJadwal;
      const result = await ContractService.getSidang(request);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /contracts/get-dokumen:
   *   post:
   *     summary: Get Dokumen
   *     tags: [Get Data]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InputIdSengketaJadwal'
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               type: string
   *       404:
   *         description: Not Found
   *       500:
   *         description: Server error
   */
  static async getDokumen(req: Request, res: Response, next: NextFunction) {
    try {
      const request: InputIdSengketaJadwal = req.body as InputIdSengketaJadwal;
      const result: StructCid = (await ContractService.getDokumen(
        request
      )) as StructCid;
      if (result.fileHash) {
        const fileResponse = await Client.cat(result.fileHash);
        if (fileResponse) {
          const filename = `${result.name}${result.extension}`;
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
          );
          res.setHeader(
            "Content-Type",
            result.mimetype || "application/octet-stream"
          );
          res.type("application/octet-stream"); // Set response type to binary
          res.end(Buffer.from(fileResponse)); // Ensure response is sent as a buffer
        } else {
          res.status(404).send("File not found");
        }
      } else {
        res.status(404).send("Metadata fileHash not found");
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  /**
   * @swagger
   * /contracts/get-dokumen-batal-cabut:
   *   post:
   *     summary: Get Dokumen
   *     tags: [Get Data]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InputIdSengketa'
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               type: string
   *       404:
   *         description: Not Found
   *       500:
   *         description: Server error
   */
  static async getDokumenBatalCabut(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const request: InputIdSengketa = req.body as InputIdSengketa;
      const result: StructCid = (await ContractService.getDokumenBatalCabut(
        request
      )) as StructCid;

      if (result.fileHash) {
        const fileResponse = await Client.cat(result.fileHash);

        if (fileResponse) {
          const filename = `${result.name}${result.extension}`;
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
          );
          res.setHeader(
            "Content-Type",
            result.mimetype || "application/octet-stream"
          );
          res.type("application/octet-stream"); // Set response type to binary
          res.end(Buffer.from(fileResponse)); // Ensure response is sent as a buffer
        } else {
          res.status(404).send("File not found");
        }
      } else {
        res.status(404).send("Metadata fileHash not found");
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
  /**
   * @swagger
   * /contracts/get-jdih:
   *   post:
   *     summary: Get JDIH
   *     tags: [Get Data]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InputIdSengketaJadwal'
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               type: string
   *       500:
   *         description: Server error
   */
  static async getJDIH(req: Request, res: Response, next: NextFunction) {
    try {
      const request: InputIdSengketaJadwal = req.body as InputIdSengketaJadwal;
      const result = await ContractService.getJDIH(request);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /contracts/get-skpd:
   *   post:
   *     summary: Get SKPD
   *     tags: [Get Data]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/InputIdSengketa'
   *     responses:
   *       200:
   *         description: Successful response
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StructSKPD'
   *       500:
   *         description: Server error
   */
  static async getSKPD(req: Request, res: Response, next: NextFunction) {
    try {
      const request: InputIdSengketa = req.body as InputIdSengketa;
      const result = await ContractService.getSKPD(request);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
