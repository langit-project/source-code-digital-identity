import chai, { expect } from "chai";
import ChaiAsPromised from "chai-as-promised";
const { ethers } = require("hardhat");
import CollectionConfig from "../config/CollectionConfig";
import { NftContractType } from "../lib/NftContractProvider";

chai.use(ChaiAsPromised);

describe(CollectionConfig.contractName, async function () {
  let contract!: NftContractType;
  let owner: any;
  let admin: any;
  let pantera: any;
  let majelis: any;
  let other: any;

  let adminRole: any;
  let panteraRole: any;
  let majelisRole: any;

  before(async function () {
    [owner, admin, pantera, majelis, other] = await ethers.getSigners();
  });

  // data sengketa valid
  const id = BigInt(1);
  const test_pemohon = "Test Pemohon 1";
  const test_termohon = "Test Termohon 1";
  const jumlah_spkd = 3;
  const spkd = ["spkd1", "spkd2", "spkd3"];
  const idJadwal = BigInt(1);
  const idJadwalUpdate = BigInt(2);

  it("Contract deployment", async function () {

    const Contract = await ethers.getContractFactory(
      CollectionConfig.contractName,
      owner
    );
    contract = (await Contract.deploy(
      await admin.getAddress(),
      await pantera.getAddress(),
      await majelis.getAddress()
    )) as any as NftContractType;
    await contract.waitForDeployment();

    adminRole = await contract.ADMIN();
    panteraRole = await contract.PANTERA();
    majelisRole = await contract.MAJELIS();
  });

  it("Check Roles", async function () {
    expect(
      await contract.hasRole(adminRole, await admin.getAddress())
    ).to.be.equal(true);
    expect(
      await contract.hasRole(panteraRole, await pantera.getAddress())
    ).to.be.equal(true);
    expect(
      await contract.hasRole(majelisRole, await majelis.getAddress())
    ).to.be.equal(true);

    // error batal id yg tidak ada
    await expect(contract.connect(admin).batalSengketa(id, "CID")).to.be.rejectedWith(
      "StatusTidakMemenuhiSyaratBatal()"
    );
    await expect(contract.connect(admin).cabutSengketa(id, "CID")).to.be.rejectedWith(
      "StatusTidakMemenuhiSyaratCabut()"
    );
  });

  it("Checking function buatSengketaBaru", async function () {
    // error bacuse permohon kosong
    await expect(
      contract.menerimaSengketa(id, "", test_termohon)
    ).to.be.rejectedWith("PemohonHarusAda()");

    // error bacuse termohon kosong
    await expect(
      contract.menerimaSengketa(id, test_pemohon, "")
    ).to.be.rejectedWith("TermohonHarusAda()");

    // sukses menerima sengketa
    await contract.menerimaSengketa(id, test_pemohon, test_termohon);
    await contract.menerimaSengketa(BigInt(10), test_pemohon, test_termohon);
    await contract.menerimaSengketa(BigInt(20), test_pemohon, test_termohon);

    // error karena id sengketa sudah ada
    await expect(
      contract.menerimaSengketa(id, test_pemohon, test_termohon)
    ).to.be.rejectedWith("SengketaSudahAda()");

    const result = await contract.getPemohonTermohon(id);
    // Assert the values
    expect(result.pemohon).to.equal(test_pemohon);
    expect(result.termohon).to.equal(test_termohon);
  });

  it("Checking function validasi", async function () {
    // sukses batal sengketa
    const otherAddress = await other.getAddress();

    // error rejected cause only admin
    await expect(
      contract.connect(other).validasiSengketa(id, jumlah_spkd, spkd)
    ).to.be.rejectedWith(
      `AccessControlUnauthorizedAccount("${otherAddress}", "${adminRole}")`
    );

    // error id sengketa belum diterima
    await expect(
      contract.connect(admin).validasiSengketa(2, jumlah_spkd, spkd)
    ).to.be.rejectedWith("CekStatusSengketa()");

    // error jumlah skpd tidak sama dengan yang diinputkan
    await expect(
      contract.connect(admin).validasiSengketa(1, jumlah_spkd - 1, spkd)
    ).to.be.rejectedWith("SkpdTidakValid()");

    // sukses
    await contract.connect(admin).validasiSengketa(id, jumlah_spkd, spkd);
    await contract.connect(admin).validasiSengketa(BigInt(10), jumlah_spkd, spkd);
    await contract.connect(admin).validasiSengketa(BigInt(20), jumlah_spkd, spkd);

    // error tidak bisa validasi dua kali
    await expect(
      contract.connect(admin).validasiSengketa(id, jumlah_spkd, spkd)
    ).to.be.rejectedWith("CekStatusSengketa()");
  });

  it("Checking function pembuatan sidang", async function () {
    const otherRole = await other.getAddress();

    function dateToUnixTime(dateString: string) {
      const date = new Date(dateString);
      const unixTime = Math.floor(date.getTime() / 1000);
      return unixTime;
    }

    const unixTime = dateToUnixTime("2024-06-18T12:00:00Z");

    // error rejected cause only admin
    await expect(
      contract
        .connect(other)
        .pembuatanSidangPemeriksaanAwal(
          id,
          idJadwal,
          "agenda",
          unixTime,
          "alamat"
        )
    ).to.be.rejectedWith(
      `AccessControlUnauthorizedAccount("${otherRole}", "${panteraRole}")`
    );

    // error rejected cause only admin
    await expect(
      contract
        .connect(other)
        .updateSidang(id, idJadwal, BigInt(1), "agenda", unixTime, "alamat")
    ).to.be.rejectedWith(
      `AccessControlUnauthorizedAccount("${otherRole}", "${panteraRole}")`
    );

    // error karena tanggal salah
    await expect(
      contract
        .connect(pantera)
        .pembuatanSidangPemeriksaanAwal(
          id,
          idJadwal,
          "agenda",
          unixTime,
          "alamat"
        )
    ).to.be.rejectedWith("TanggalTidakValid()");

    // error karena karena harus memalui pembuatanSidangPemeriksaanAwal terlebih dahulu
    await expect(
      contract
        .connect(pantera)
        .updateSidang(id, idJadwal, BigInt(1), "agenda", unixTime, "alamat")
    ).to.be.rejectedWith("StatusSengketaHarusDalamSidang()");

    function getCurrentUnixTime() {
      const now = new Date();
      const unixTime = Math.floor(now.getTime() + 7200000 / 1000);
      return unixTime;
    }

    // sukses sidang pemeriksaan awal
    await contract
      .connect(pantera)
      .pembuatanSidangPemeriksaanAwal(
        id,
        idJadwal,
        "agenda",
        getCurrentUnixTime(),
        "alamat"
      );
    await contract
      .connect(pantera)
      .pembuatanSidangPemeriksaanAwal(
        BigInt(20),
        idJadwal,
        "agenda",
        getCurrentUnixTime(),
        "alamat"
      );

    // error karena status sidang sudah masuk ke sidang tidak tervalidasi lagi
    await expect(
      contract
        .connect(pantera)
        .pembuatanSidangPemeriksaanAwal(
          id,
          idJadwal,
          "agenda",
          getCurrentUnixTime(),
          "alamat"
        )
    ).to.be.rejectedWith("SengketaBelumTervalidasi()");

    // error update sidang karena id jadwal masih sama dengan yg sebelumnya
    await expect(
      contract
        .connect(pantera)
        .updateSidang(
          id,
          idJadwal,
          BigInt(1),
          "agenda",
          getCurrentUnixTime(),
          "alamat"
        )
    ).to.be.rejectedWith("IdSidangSudahTerisi()");

    // sukses update sidang
    await contract
      .connect(pantera)
      .updateSidang(
        id,
        idJadwalUpdate,
        BigInt(2),
        "agenda",
        getCurrentUnixTime(),
        "alamat"
      );

    const result = await contract.getSidang(id, idJadwalUpdate);
    expect(result.jenis).to.equal(BigInt(2));
    expect(result.agenda).to.equal("agenda");
    expect(result.alamat).to.equal("alamat");
  });

  it("Checking function putusan", async function () {
    const otherRole = await other.getAddress();

    // error rejected cause only admin
    await expect(
      contract
        .connect(other)
        .tambahPutusan(id, idJadwal, BigInt(1), "CID", "JDIH")
    ).to.be.rejectedWith(
      `AccessControlUnauthorizedAccount("${otherRole}", "${majelisRole}")`
    );
    await expect(
      contract
        .connect(other)
        .putusanSelesai(id, idJadwal, BigInt(1), "CID", "JDIH")
    ).to.be.rejectedWith(
      `AccessControlUnauthorizedAccount("${otherRole}", "${majelisRole}")`
    );

    // error sidang id tidak ada
    await expect(
      contract
        .connect(majelis)
        .tambahPutusan(id, idJadwalUpdate + BigInt(1), BigInt(1), "CID", "JDIH")
    ).to.be.rejectedWith("SidangTidakAda()");

    // error putusan selesai JDIH tidak diisi
    await expect(
      contract
        .connect(majelis)
        .putusanSelesai(id, idJadwalUpdate, BigInt(1), "CID", "")
    ).to.be.rejectedWith("WajibJDIH()");

    // sukses melakukan tambah putusan
    await contract
      .connect(majelis)
      .tambahPutusan(id, idJadwalUpdate, BigInt(1), "CID", "JDIH");

    // sukses melakukan putusan selesai
    await contract
      .connect(majelis)
      .putusanSelesai(id, idJadwalUpdate, BigInt(1), "CID", "JDIH");

    // error melakukan lagi karena putusan sudah selesai
    await expect(
      contract
        .connect(majelis)
        .tambahPutusan(id, idJadwalUpdate, BigInt(1), "CID", "JDIH")
    ).to.be.rejectedWith("PutusanSudahDitentukan()");
    await expect(
      contract
        .connect(majelis)
        .putusanSelesai(id, idJadwalUpdate, BigInt(1), "CID", "JDIH")
    ).to.be.rejectedWith("PutusanSudahDitentukan()");

    function getCurrentUnixTime() {
      const now = new Date();
      const unixTime = Math.floor(now.getTime() + 7200000 / 1000);
      return unixTime;
    }
    // error karena id jadwlah sudah diputuskan selesai
    await expect(
      contract
        .connect(pantera)
        .updateSidang(
          id,
          idJadwalUpdate + BigInt(1),
          BigInt(0),
          "agenda",
          getCurrentUnixTime(),
          "alamat"
        )
    ).to.be.rejectedWith("StatusSengketaHarusDalamSidang()");

    // get JDIH
    expect(await contract.getJDIH(id, idJadwalUpdate)).to.equal("JDIH");
  });

  it("Batal Cabut", async function () {
    // error karena bukan batal sengketa
    await expect(
      contract
        .connect(admin)
        .batalSengketa(BigInt(20), "CID")
    ).to.be.rejectedWith("StatusTidakMemenuhiSyaratBatal()");

    // error karena bukan cabut sengketa
    await expect(
      contract
        .connect(admin)
        .cabutSengketa(BigInt(10), "CID")
    ).to.be.rejectedWith("StatusTidakMemenuhiSyaratCabut()");

    // sukses
    await contract
      .connect(admin)
      .batalSengketa(BigInt(10), "CID10");
    await contract
      .connect(admin)
      .cabutSengketa(BigInt(20), "CID20");

    // error cabut dan batal lagi
    await expect(
      contract
        .connect(admin)
        .batalSengketa(BigInt(10), "CID10")
    ).to.be.rejectedWith("StatusTidakMemenuhiSyaratBatal()");
    await expect(
      contract
        .connect(admin)
        .cabutSengketa(BigInt(20), "CID20")
    ).to.be.rejectedWith("StatusTidakMemenuhiSyaratCabut()");

    // get dokumen batal dan cabut
    expect(await contract.getDokumenBatalCabut(BigInt(10))).to.equal("CID10");
    expect(await contract.getDokumenBatalCabut(BigInt(20))).to.equal("CID20");
  });

});
