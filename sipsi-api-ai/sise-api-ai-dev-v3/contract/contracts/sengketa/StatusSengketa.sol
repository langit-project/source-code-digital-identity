// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

error SengketaBelumTervalidasi();

contract StatusSengketa {
    enum EnumStatus {
        Available,
        Diterima,
        Tervalidasi,
        Batal,
        Sidang,
        Cabut,
        Putusan
    }

    struct StructStatus {
        uint256 waktu;
        EnumStatus status;
    }

    mapping(uint256 => StructStatus) private _mappingStatus;

    function _setStatusDibuat(uint256 _idSengketa) internal {
        _mappingStatus[_idSengketa] = StructStatus({
            waktu: block.timestamp,
            status: EnumStatus.Diterima
        });
    }

    function _setStatusValidasi(uint256 _idSengketa) internal {
        _mappingStatus[_idSengketa] = StructStatus({
            waktu: block.timestamp,
            status: EnumStatus.Tervalidasi
        });
    }

    function _setStatusBatal(uint256 _idSengketa) internal {
        _mappingStatus[_idSengketa] = StructStatus({
            waktu: block.timestamp,
            status: EnumStatus.Batal
        });
    }

    function _setStatusSidang(uint256 _idSengketa) internal {
        _mappingStatus[_idSengketa] = StructStatus({
            waktu: block.timestamp,
            status: EnumStatus.Sidang
        });
    }

    function _setStatusCabut(uint256 _idSengketa) internal {
        _mappingStatus[_idSengketa] = StructStatus({
            waktu: block.timestamp,
            status: EnumStatus.Cabut
        });
    }

    function _setStatusPutusan(uint256 _idSengketa) internal {
        _mappingStatus[_idSengketa] = StructStatus({
            waktu: block.timestamp,
            status: EnumStatus.Putusan
        });
    }

    function _getStatus(
        uint256 _idSengketa
    ) internal view returns (EnumStatus) {
        return _mappingStatus[_idSengketa].status;
    }
}
