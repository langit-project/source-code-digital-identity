// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {PembuatanJadwalSidang} from "./PembuatanJadwalSidang.sol";

error SidangTidakAda();
error PutusanSudahDitentukan();
error CekDokumen();
error WajibJDIH();

contract TambahPutusan is PembuatanJadwalSidang {
    enum StatusPutusan {
        Sela,
        Gugur,
        Akhir,
        MediasiBerhasil,
        MediasiGagal,
        Lainnya
    }

    struct StructPutusan {
        StatusPutusan putusan;
        string cid;
        string jdih;
    }

    struct StructPutusanSelesai {
        uint256 idJadwal;
        string cid;
        string jdih;
    }

    mapping(uint256 => mapping(uint256 => StructPutusan))
        internal _mappingPutusan;
    mapping(uint256 => StructPutusanSelesai) private _mappingPutusanSelesai;

    function _tambahPutusan(
        uint256 _idSengketa,
        uint256 _idJadwal,
        StatusPutusan _putusan,
        string memory _cid,
        string memory _jdih
    ) internal {
        if (_getStatus(_idSengketa) == EnumStatus.Putusan) {
            revert PutusanSudahDitentukan();
        }
        uint256 _tanggalSidang = _mappingSidang[_idSengketa][_idJadwal].tanggal;
        if (_tanggalSidang == 0) {
            revert SidangTidakAda();
        }
        _mappingPutusan[_idSengketa][_idJadwal] = StructPutusan({
            putusan: _putusan,
            cid: _cid,
            jdih: _jdih
        });
    }

    function _putusanSelesai(
        uint256 _idSengketa,
        uint256 _idJadwal,
        StatusPutusan _putusan,
        string memory _cid,
        string memory _jdih
    ) internal {
        uint256 _cekJdih = bytes(_jdih).length;
        if (_cekJdih == 0) {
            revert WajibJDIH();
        }
        _tambahPutusan(_idSengketa, _idJadwal, _putusan, _cid, _jdih);
        _setStatusPutusan(_idSengketa);
    }

    function getDokumen(
        uint256 idSengketa,
        uint256 _idJadwal
    ) external view returns (string memory) {
        return _mappingPutusan[idSengketa][_idJadwal].cid;
    }

    function getJDIH(
        uint256 idSengketa,
        uint256 _idJadwal
    ) external view returns (string memory) {
        return _mappingPutusan[idSengketa][_idJadwal].jdih;
    }
}
