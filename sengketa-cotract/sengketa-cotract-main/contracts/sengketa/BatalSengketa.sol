// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {TambahPutusan} from "./TambahPutusan.sol";

error StatusTidakMemenuhiSyaratBatal();
error StatusTidakMemenuhiSyaratCabut();

contract BatalSengketa is TambahPutusan {
    mapping(uint256 => string) private _mappingBatalCabut;

    function _batalSengketa(uint256 _idSengketa, string memory _cid) internal {
        EnumStatus _status = _getStatus(_idSengketa);
        if (
            _status != EnumStatus.Diterima && _status != EnumStatus.Tervalidasi
        ) {
            revert StatusTidakMemenuhiSyaratBatal();
        }
        _setStatusBatal(_idSengketa);
        _mappingBatalCabut[_idSengketa] = _cid;
    }

    function _cabutSengketa(uint256 _idSengketa, string memory _cid) internal {
        if (_getStatus(_idSengketa) != EnumStatus.Sidang) {
            revert StatusTidakMemenuhiSyaratCabut();
        }
        _setStatusCabut(_idSengketa);
        _mappingBatalCabut[_idSengketa] = _cid;
    }

    function getDokumenBatalCabut(
        uint256 idSengketa
    ) external view returns (string memory) {
        return _mappingBatalCabut[idSengketa];
    }
}
