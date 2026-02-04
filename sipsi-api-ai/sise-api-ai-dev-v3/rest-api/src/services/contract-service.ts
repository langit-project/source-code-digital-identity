import {
  admin,
  pantera,
  majelis,
  sengketAbi,
  publicClient,
  sengketaContractAddress,
} from "../config/contract-config";
import {
  ContractResponse,
  toContractResponse,
  MenerimaSengketa,
  ValidasiSengketa,
  PembuatanSidangAwal,
  TambahSidang,
  TambahPutusan,
  ResponseTambahPutusan,
  RequestBatalCabut,
  InputIdSengketa,
  InputIdSengketaJadwal,
  GetContractResponse,
  StructSengketa,
  toGetContractResponse,
  StructSidang,
  StructSKPD,
  StructJdih,
  StructCid,
  ResponseBatalCabut,
} from "../models/contract-model";
import { ContractValidation } from "../validations/contract-validation";
import { Client } from "./ipfs-service";
import { Address } from "viem";

export class ContractService {
  static async menerimaSengketa(
    request: MenerimaSengketa
  ): Promise<ContractResponse<MenerimaSengketa> | undefined> {
    try {
      // Validasi request menggunakan ContractValidation.CREATE
      const createRequest = ContractValidation.MENERIMA.parse(request);

      // Memanggil metode `writeContract` dengan argumen yang sesuai
      const tx = await admin.writeContract({
        address: sengketaContractAddress as Address,
        abi: sengketAbi,
        functionName: "menerimaSengketa",
        args: [
          createRequest.idSengketa,
          createRequest.pemohon,
          createRequest.termohon,
        ],
      });
      return toContractResponse(request, tx);
    } catch (error) {
      console.error(error);
    }
  }

  static async validasiSengketa(
    request: ValidasiSengketa
  ): Promise<ContractResponse<ValidasiSengketa> | undefined> {
    try {
      const createRequest = ContractValidation.VALIDASI.parse(request);
      const tx = await admin.writeContract({
        address: sengketaContractAddress as Address,
        abi: sengketAbi,
        functionName: "validasiSengketa",
        args: [
          createRequest.idSengketa,
          createRequest.jumlah,
          createRequest.skpd,
        ],
      });
      return toContractResponse(request, tx);
    } catch (error) {
      console.error(error);
    }
  }

  static async pembuatanJadwalSidangAwal(
    request: PembuatanSidangAwal
  ): Promise<ContractResponse<PembuatanSidangAwal> | undefined> {
    try {
      const createRequest = ContractValidation.SIDANG_AWAL.parse(request);
      const tx = await pantera.writeContract({
        address: sengketaContractAddress as Address,
        abi: sengketAbi,
        functionName: "pembuatanSidangPemeriksaanAwal",
        args: [
          createRequest.idSengketa,
          createRequest.idJadwal,
          createRequest.agenda,
          createRequest.tanggal,
          createRequest.alamat,
        ],
      });
      return toContractResponse(request, tx);
    } catch (error) {
      console.error(error);
    }
  }

  static async tambahSidang(
    request: TambahSidang
  ): Promise<ContractResponse<TambahSidang> | undefined> {
    try {
      const createRequest = ContractValidation.TAMBAH_SIDANG.parse(request);
      const tx = await pantera.writeContract({
        address: sengketaContractAddress as Address,
        abi: sengketAbi,
        functionName: "updateSidang",
        args: [
          createRequest.idSengketa,
          createRequest.idJadwal,
          createRequest.jenis,
          createRequest.agenda,
          createRequest.tanggal,
          createRequest.alamat,
        ],
      });
      return toContractResponse(request, tx);
    } catch (error) {
      console.error(error);
    }
  }

  static async getCID(file: Express.Multer.File | undefined): Promise<string> {
    if (file) {
      const fileUploadResponse = await Client.add(file);
      if (!fileUploadResponse) {
        throw new Error("File upload failed");
      }
      return fileUploadResponse.metadataHash;
    } else {
      return "";
    }
  }

  static async tambahPutusan(
    request: TambahPutusan
  ): Promise<ContractResponse<ResponseTambahPutusan> | undefined> {
    try {
      // Validate the parsed request
      const createRequest = ContractValidation.TAMBAH_PUTUSAN.parse(request);
      const cid: string = await this.getCID(request.cid);

      // Create the transaction
      const tx = await majelis.writeContract({
        address: sengketaContractAddress as Address,
        abi: sengketAbi,
        functionName: "tambahPutusan",
        args: [
          createRequest.idSengketa,
          createRequest.idJadwal,
          createRequest.statusPutusan,
          cid,
          createRequest.jdih || "",
        ],
      });

      const enhancedRequest: ResponseTambahPutusan = {
        idSengketa: createRequest.idSengketa.toString(),
        idJadwal: createRequest.idJadwal.toString(),
        statusPutusan: createRequest.statusPutusan.toString(),
        cid: cid,
        jdih: createRequest.jdih,
      };

      return toContractResponse(enhancedRequest, tx);
    } catch (error) {
      console.error("Error in tambahPutusan:", error);
      throw new Error("Failed to execute tambahPutusan");
    }
  }

  static async putusanSelesai(
    request: TambahPutusan
  ): Promise<ContractResponse<ResponseTambahPutusan> | undefined> {
    try {
      // Validate the parsed request
      const createRequest = ContractValidation.TAMBAH_PUTUSAN.parse(request);
      const cid: string = await this.getCID(request.cid);

      // Create the transaction
      const tx = await majelis.writeContract({
        address: sengketaContractAddress as Address,
        abi: sengketAbi,
        functionName: "putusanSelesai",
        args: [
          createRequest.idSengketa,
          createRequest.idJadwal,
          createRequest.statusPutusan,
          cid,
          createRequest.jdih || "",
        ],
      });
      // Construct enhanced request
      const enhancedRequest: ResponseTambahPutusan = {
        idSengketa: createRequest.idSengketa.toString(),
        idJadwal: createRequest.idJadwal.toString(),
        statusPutusan: createRequest.statusPutusan.toString(),
        cid: cid,
        jdih: createRequest.jdih,
      };

      return toContractResponse(enhancedRequest, tx);
    } catch (error) {
      console.error("Error in putusanSelesai:", error);
      throw new Error("Failed to execute putusanSelesai");
    }
  }

  static async batalSengketa(
    request: RequestBatalCabut
  ): Promise<ContractResponse<ResponseBatalCabut> | undefined> {
    try {
      const createRequest = ContractValidation.BATAL_CABUT.parse(request);
      const cidMetadata: string = await this.getCID(createRequest.cid);

      const tx = await admin.writeContract({
        address: sengketaContractAddress as Address,
        abi: sengketAbi,
        functionName: "batalSengketa",
        args: [createRequest.idSengketa, cidMetadata],
      });
      const res: ResponseBatalCabut = {
        idSengketa: createRequest.idSengketa.toString(),
        cid: cidMetadata,
      }

      return toContractResponse(res, tx);
    } catch (error) {
      console.error(error);
    }
  }

  static async cabutSengketa(
    request: RequestBatalCabut
  ): Promise<ContractResponse<ResponseBatalCabut> | undefined> {
    try {
      const createRequest = ContractValidation.BATAL_CABUT.parse(request);
      const cidMetadata: string = await this.getCID(request.cid);

      const tx = await admin.writeContract({
        address: sengketaContractAddress as Address,
        abi: sengketAbi,
        functionName: "cabutSengketa",
        args: [createRequest.idSengketa, cidMetadata],
      });
      const res: ResponseBatalCabut = {
        idSengketa: createRequest.idSengketa.toString(),
        cid: cidMetadata,
      }

      return toContractResponse(res, tx);
    } catch (error) {
      console.error(error);
    }
  }

  static async getPemohonTermohon(
    request: InputIdSengketa
  ): Promise<GetContractResponse<StructSengketa>> {
    try {
      // Validate and parse the request
      const createRequest = ContractValidation.ID_SENGKETA.parse(request);
      // Read contract data
      const response = (await publicClient.readContract({
        address: sengketaContractAddress as Address,
        abi: sengketAbi,
        functionName: "getPemohonTermohon",
        args: [createRequest.idSengketa],
      })) as StructSengketa;
      // Create response object
      const res: StructSengketa = {
        pemohon: response.pemohon,
        termohon: response.termohon,
      };

      // Return the combined response
      return toGetContractResponse(request, res);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get Pemohon and Termohon");
    }
  }

  static async getSidang(
    request: InputIdSengketaJadwal
  ): Promise<GetContractResponse<StructSidang>> {
    try {
      const createRequest = ContractValidation.ID_SENGKETA_JADWAL.parse(request);
      const response = (await publicClient.readContract({
        address: sengketaContractAddress as Address,
        abi: sengketAbi,
        functionName: "getSidang",
        args: [createRequest.idSengketa, createRequest.idJadwal],
      })) as StructSidang;

      const res: StructSidang = {
        jenis: response.jenis.toString(),
        agenda: response.agenda,
        tanggal: response.tanggal.toString(),
        alamat: response.alamat,
      };

      return toGetContractResponse(request, res);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get Sidang");
    }
  }

  static async getDokumen(request: InputIdSengketaJadwal): Promise<StructCid> {
    try {
      const createRequest = ContractValidation.ID_SENGKETA_JADWAL.parse(request);
      const response = await publicClient.readContract({
        address: sengketaContractAddress as Address,
        abi: sengketAbi,
        functionName: "getDokumen",
        args: [createRequest.idSengketa, createRequest.idJadwal],
      }) as string;

      let metadata: StructCid;
      if (response) {
        metadata = await Client.getMetadata(response) as StructCid;
        console.log("metadata: ", metadata);
        if (!metadata || !metadata.fileHash) {
          throw new Error("Metadata not found or invalid");
        }
      } else {
        throw new Error("Dokumen not found");
      }
      return metadata;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get Dokumen");
    }
  }

  static async getDokumenBatalCabut(request: InputIdSengketa): Promise<StructCid> {
    try {
      const createRequest = ContractValidation.ID_SENGKETA.parse(request);
      const response = await publicClient.readContract({
        address: sengketaContractAddress as Address,
        abi: sengketAbi,
        functionName: "getDokumenBatalCabut",
        args: [createRequest.idSengketa],
      }) as string;

      let metadata: StructCid;
      if (response) {
        metadata = await Client.getMetadata(response) as StructCid;
        console.log("metadata: ", metadata);
        if (!metadata || !metadata.fileHash) {
          throw new Error("Metadata not found or invalid");
        }
      } else {
        throw new Error("Dokumen not found");
      }
      return metadata;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get Dokumen");
    }
  }
  static async getJDIH(request: InputIdSengketaJadwal): Promise<GetContractResponse<StructJdih>> {
    try {
      const createRequest = ContractValidation.ID_SENGKETA_JADWAL.parse(request);
      const response = (await publicClient.readContract({
        address: sengketaContractAddress as Address,
        abi: sengketAbi,
        functionName: "getJDIH",
        args: [createRequest.idSengketa, createRequest.idJadwal],
      })) as StructJdih;
      return toGetContractResponse(request, response);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get JDIH");
    }
  }

  static async getSKPD(
    request: InputIdSengketa
  ): Promise<GetContractResponse<StructSKPD>> {
    try {
      const createRequest = ContractValidation.ID_SENGKETA.parse(request);
      const response = (await publicClient.readContract({
        address: sengketaContractAddress as Address,
        abi: sengketAbi,
        functionName: "getSKPD",
        args: [createRequest.idSengketa],
      })) as StructSKPD;

      const res: StructSKPD = {
        jumlah: response.jumlah.toString(),
        skpd: response.skpd,
      };
      return toGetContractResponse(request, res);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get SKPD");
    }
  }
}
