export type MenerimaSengketa = {
  idSengketa: string;
  pemohon: string;
  termohon: string;
};

export type ValidasiSengketa = {
  idSengketa: string;
  jumlah?: string;
  skpd?: string[];
};

export type PembuatanSidangAwal = {
  idSengketa: string;
  idJadwal: string;
  agenda: string;
  tanggal: Date;
  alamat: string;
};

export type TambahSidang = {
  idSengketa: string;
  idJadwal: string;
  jenis: string;
  agenda: string;
  tanggal: Date;
  alamat: string;
};

export type TambahPutusan = {
  idSengketa: string;
  idJadwal: string;
  statusPutusan: string;
  cid?: Express.Multer.File;
  jdih?: string;
};

export type ResponseTambahPutusan = {
  idSengketa: string;
  idJadwal: string;
  statusPutusan: string;
  cid?: string;
  jdih?: string;
};

export type RequestBatalCabut = {
  idSengketa: string;
  cid?: Express.Multer.File;
};

export type ResponseBatalCabut = {
  idSengketa: string;
  cid?: string;
}

export type ContractResponse<T = {}> = T & {
  hash: string;
};

export function toContractResponse<T>(
  data: T,
  response: string
): ContractResponse<T> {
  return { ...data, hash: response };
}

export type InputIdSengketa = {
  idSengketa: string;
}

export type InputIdSengketaJadwal = {
  idSengketa: string;
  idJadwal: string;
};

export type StructSengketa = {
  pemohon: string;
  termohon: string;
}

export type StructSidang = {
  jenis: string;
  agenda: string;
  tanggal: string;
  alamat: string;
}

export type StructSKPD = {
  jumlah: string;
  skpd: string[];
}

export type StructCid = {
  name: string;
  mimetype: string;
  size: number;
  extension: string;
  fileHash: string;
}

export type StructJdih = {
  jdih?: string;
}

export type GetContractResponse<T = {}> = T & {
  idSengketa: string;
  idJadwal?: string;
};

export function toGetContractResponse<T>(
  response: any,
  data: T
): GetContractResponse<T> {
  return { ...response, ...data };
}
