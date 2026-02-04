const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("SengketaModule", (m) => {
  // Define the addresses for the different roles
  const adminAddress = "0x1082f6bF761FCe2B585A87a7E787123aD3D5F8a3";
  const panteraAddress = "0x1082f6bF761FCe2B585A87a7E787123aD3D5F8a3";
  const majelisAddress = "0x1082f6bF761FCe2B585A87a7E787123aD3D5F8a3";

  // Deploy the SengketaContract with the required constructor parameters
  const sengketaContract = m.contract("SengketaContract", [
    adminAddress,
    panteraAddress,
    majelisAddress,
  ]);

  return { sengketaContract };
});
