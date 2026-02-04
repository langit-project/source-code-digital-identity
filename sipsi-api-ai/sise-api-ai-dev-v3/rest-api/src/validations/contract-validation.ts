import { string, z, ZodType, infer } from "zod";

const numberInput = z
  .string()
  .refine(
    (val) => {
      try {
        BigInt(val);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: "Invalid BigInt format",
    }
  )
  .transform((val) => BigInt(val));
const statusCourtSchema = z
  .string()
  .refine(
    (val) => {
      try {
        const statusBigInt = BigInt(val);
        return statusBigInt >= BigInt(0) && statusBigInt <= BigInt(2);
      } catch {
        return false;
      }
    },
    {
      message: "Invalid BigInt format for status",
    }
  )
  .transform((val) => BigInt(val));
  const statusDecisionSchema = z
  .string()
  .refine(
    (val) => {
      try {
        const statusBigInt = BigInt(val);
        return statusBigInt >= BigInt(0) && statusBigInt <= BigInt(5);
      } catch {
        return false;
      }
    },
    {
      message: "Invalid BigInt format for status",
    }
  )
  .transform((val) => BigInt(val));
const futureDateStringSchema = z
  .string()
  .refine(
    (dateStr) => {
      const date = new Date(dateStr);
      const now = new Date();
      return !isNaN(date.getTime()) && date >= now;
    },
    {
      message: "Date must not be in the past.",
    }
  )
  .transform((dateStr) => {
    const timestamp = Math.floor(new Date(dateStr).getTime() / 1000); // Convert to Unix time in seconds
    if (!Number.isSafeInteger(timestamp)) {
      throw new Error("Timestamp is not a safe integer.");
    }
    return BigInt(timestamp); // Convert to BigInt
  });

  const pdfFileInput = z.custom<Express.Multer.File>((file) => {
    return file instanceof Object && file.mimetype === "application/pdf";
  }, {
    message: "Expected a PDF file",
  });

export class ContractValidation {
  static readonly MENERIMA: ZodType = z.object({
    idSengketa: numberInput,
    pemohon: z.string().min(1).max(255),
    termohon: z.string().min(1).max(255),
  });

  static readonly VALIDASI: ZodType = z.object({
    idSengketa: numberInput,
    jumlah: numberInput.optional(),
    skpd: z.array(z.string()).optional(),
  });

  static readonly SIDANG_AWAL: ZodType = z.object({
    idSengketa: numberInput,
    idJadwal: numberInput,
    agenda: z.string().optional(),
    tanggal: futureDateStringSchema,
    alamat: z.string().optional(),
  });

  static readonly TAMBAH_SIDANG: ZodType = z.object({
    idSengketa: numberInput,
    idJadwal: numberInput,
    jenis: statusCourtSchema,
    agenda: z.string().optional(),
    tanggal: futureDateStringSchema,
    alamat: z.string().optional(),
  });

  static readonly TAMBAH_PUTUSAN: ZodType = z.object({
    idSengketa: numberInput,
    idJadwal: numberInput,
    statusPutusan: statusDecisionSchema,
    cid: pdfFileInput.optional(),
    jdih: z.string().optional(),
  });

  static readonly PUTUSAN_SELESAI: ZodType = z.object({
    idSengketa: numberInput,
    idJadwal: numberInput,
    statusPutusan: statusDecisionSchema,
    jdih: z.string().optional(),
  });

  static readonly BATAL_CABUT: ZodType = z.object({
    idSengketa: numberInput,
    cid: pdfFileInput.optional(),
  });
  
  static readonly ID_SENGKETA: ZodType = z.object({
    idSengketa: numberInput,
  });

  static readonly ID_SENGKETA_JADWAL: ZodType = z.object({
    idSengketa: numberInput,
    idJadwal: numberInput,
  });
}
