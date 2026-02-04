// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {BatalSengketa} from "./sengketa/BatalSengketa.sol";

// Errors
error SengketaSudahAda();
error InvalidDocs();
error SengketaNotExist();
error InvalidDate();
error CheckStatusSengketa();

contract SengketaContract is AccessControl, BatalSengketa {
    // Setup roles
    bytes32 public constant SUPER_ADMIN = keccak256("SUPER_ADMIN");
    bytes32 public constant ADMIN = keccak256("ADMIN");
    bytes32 public constant PANTERA = keccak256("PANTERA");
    bytes32 public constant MAJELIS = keccak256("MAJELIS");

    constructor(
        address setAdminDocument,
        address setPanteraSengketa,
        address setMajelisKomisioner
    ) {
        _grantRole(SUPER_ADMIN, msg.sender);
        _grantRole(ADMIN, setAdminDocument);
        _grantRole(PANTERA, setPanteraSengketa);
        _grantRole(MAJELIS, setMajelisKomisioner);
    }

    function menerimaSengketa(
        uint256 idSengketa,
        string memory pemohonBaru,
        string memory termohonBaru
    ) external {
        _menerimaSengketa(idSengketa, pemohonBaru, termohonBaru);
    }

    function validasiSengketa(
        uint256 idSengketa,
        uint256 jumlah,
        string[] memory skpd
    ) external onlyRole(ADMIN) {
        _validasiSengketa(idSengketa, jumlah, skpd);
    }

    function pembuatanSidangPemeriksaanAwal(
        uint256 idSengketa,
        uint256 idJadwal,
        string memory agenda,
        uint256 tanggal,
        string memory alamat
    ) external onlyRole(PANTERA) {
        _pembuatanSidangPemeriksaanAwal(
            idSengketa,
            idJadwal,
            agenda,
            tanggal,
            alamat
        );
    }

    function updateSidang(
        uint256 idSengketa,
        uint256 idJadwal,
        Jenis jenis,
        string memory agenda,
        uint256 tanggal,
        string memory alamat
    ) external onlyRole(PANTERA) {
        _updateSidang(idSengketa, idJadwal, jenis, agenda, tanggal, alamat);
    }

    function tambahPutusan(
        uint256 idSengketa,
        uint256 idJadwal,
        StatusPutusan putusan,
        string memory cid,
        string memory jdih
    ) external onlyRole(MAJELIS) {
        _tambahPutusan(idSengketa, idJadwal, putusan, cid, jdih);
    }

    function putusanSelesai(
        uint256 idSengketa,
        uint256 idJadwal,
        StatusPutusan putusan,
        string memory cid,
        string memory jdih
    ) external onlyRole(MAJELIS) {
        _putusanSelesai(idSengketa, idJadwal, putusan, cid, jdih);
    }

    function batalSengketa(uint256 idSengketa, string memory cid) external onlyRole(ADMIN) {
        _batalSengketa(idSengketa, cid);
    }

    function cabutSengketa(uint256 idSengketa, string memory cid) external onlyRole(ADMIN) {
        _cabutSengketa(idSengketa, cid);
    }
    
    /**
     * ===============================================================================
     * SUPER ADMIN FUNCTION
     *
     * Hanya super admin yang bisa menjalankan ini
     * ===============================================================================
     */

    function setAdmin(address _admin) external onlyRole(SUPER_ADMIN) {
        grantRole(ADMIN, _admin);
    }

    function setPantera(address _pantera) external onlyRole(SUPER_ADMIN) {
        grantRole(PANTERA, _pantera);
    }

    function setMajelis(address _majelis) external onlyRole(SUPER_ADMIN) {
        grantRole(MAJELIS, _majelis);
    }

    function setSuperAdmin(address _superAdmin) external onlyRole(SUPER_ADMIN) {
        grantRole(SUPER_ADMIN, _superAdmin);
    }
}
