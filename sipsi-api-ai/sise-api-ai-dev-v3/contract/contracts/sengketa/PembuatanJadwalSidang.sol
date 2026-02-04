// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ValidasiSengketa} from "./ValidasiSengketa.sol";

error IdSidangSudahTerisi();
error SengketaBelumTervalidasi();
error StatusSengketaHarusDalamSidang();
error TanggalTidakValid();
error PutusanSudahAkhir();

contract PembuatanJadwalSidang is ValidasiSengketa {
    enum Jenis {
        PemeriksaanAwal,
        Mediasi,
        Ajudikasi
    }

    struct StructSidang {
        Jenis jenis;
        string agenda;
        uint256 tanggal;
        string alamat;
    }

    mapping(uint256 => mapping(uint256 => StructSidang)) internal _mappingSidang;

    function _pembuatanSidang(
        uint256 _idSengketa,
        uint256 _idJadwal,
        Jenis _jenis,
        string memory _agenda,
        uint256 _tanggal,
        string memory _alamat
    ) private {
        if (_getStatus(_idSengketa) == EnumStatus.Putusan) {
            revert PutusanSudahAkhir();
        }
        if (_tanggal <= block.timestamp) {
            revert TanggalTidakValid();
        }

        _mappingSidang[_idSengketa][_idJadwal] = StructSidang({
            jenis: _jenis,
            agenda: _agenda,
            tanggal: _tanggal,
            alamat: _alamat
        });
    }

    function _pembuatanSidangPemeriksaanAwal(
        uint256 _idSengketa,
        uint256 _idJadwal,
        string memory _agenda,
        uint256 _tanggal,
        string memory _alamat
    ) internal {
        EnumStatus _status = _getStatus(_idSengketa);
        if (_status != EnumStatus.Tervalidasi) {
            revert SengketaBelumTervalidasi();
        }
        _pembuatanSidang(
            _idSengketa,
            _idJadwal,
            Jenis.PemeriksaanAwal,
            _agenda,
            _tanggal,
            _alamat
        );
        _setStatusSidang(_idSengketa);
    }

    function _updateSidang(
        uint256 _idSengketa,
        uint256 _idJadwal,
        Jenis _jenis,
        string memory _agenda,
        uint256 _tanggal,
        string memory _alamat
    ) internal {
        EnumStatus _status = _getStatus(_idSengketa);
        if (_status != EnumStatus.Sidang) {
            revert StatusSengketaHarusDalamSidang();
        }
        uint256 _tanggalSidang = _mappingSidang[_idSengketa][_idJadwal].tanggal;
        if (_tanggalSidang != 0) {
            revert IdSidangSudahTerisi();
        }
        _pembuatanSidang(
            _idSengketa,
            _idJadwal,
            _jenis,
            _agenda,
            _tanggal,
            _alamat
        );
    }

    function getSidang(
        uint256 _idSengketa,
        uint256 _idJadwal
    ) external view returns (StructSidang memory) {
        return _mappingSidang[_idSengketa][_idJadwal];
    }
}
