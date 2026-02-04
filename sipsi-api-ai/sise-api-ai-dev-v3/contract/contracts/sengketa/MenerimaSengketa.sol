// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {StatusSengketa} from "./StatusSengketa.sol";

error SengketaSudahAda();
error PemohonHarusAda();
error TermohonHarusAda();

contract MenerimaSengketa is StatusSengketa {
    struct StructSengketa {
        string pemohon;
        string termohon;
    }
    mapping(uint256 => StructSengketa) internal _mappingSengketa;

    function _menerimaSengketa(
        uint256 _idSengketa,
        string memory _pemohonBaru,
        string memory _termohonBaru
    ) internal {
        if(_getStatus(_idSengketa) != EnumStatus.Available) {
            revert SengketaSudahAda();
        }
        if (bytes(_pemohonBaru).length == 0) {
            revert PemohonHarusAda();
        }
        if (bytes(_termohonBaru).length == 0) {
            revert TermohonHarusAda();
        }

        _mappingSengketa[_idSengketa] = StructSengketa({
            pemohon: _pemohonBaru,
            termohon: _termohonBaru
        });
        _setStatusDibuat(_idSengketa);
    }

    function getPemohonTermohon(
        uint256 idSengketa
    ) external view returns (StructSengketa memory) {
        return _mappingSengketa[idSengketa];
    }
}
