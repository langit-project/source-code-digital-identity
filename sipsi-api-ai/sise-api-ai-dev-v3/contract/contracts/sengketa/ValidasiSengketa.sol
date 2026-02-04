// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MenerimaSengketa} from "./MenerimaSengketa.sol";

error CekStatusSengketa();
error SkpdTidakValid();

contract ValidasiSengketa is MenerimaSengketa {
    struct StructSKPD {
        uint256 jumlah;
        string[] skpd;
    }

    mapping(uint256 => StructSKPD) private _mappingSKPD;

    function _validasiSengketa(
        uint256 _idSengketa,
        uint256 _jumlah,
        string[] memory _skpd
    ) internal {
        if (_getStatus(_idSengketa) != EnumStatus.Diterima) {
            revert CekStatusSengketa();
        }
        if (_jumlah != _skpd.length) {
            revert SkpdTidakValid();
        }
        _mappingSKPD[_idSengketa] = StructSKPD({jumlah: _jumlah, skpd: _skpd});
        _setStatusValidasi(_idSengketa);
    }

    function getSKPD(
        uint256 _idSengketa
    ) external view returns (StructSKPD memory) {
        return _mappingSKPD[_idSengketa];
    }
}
