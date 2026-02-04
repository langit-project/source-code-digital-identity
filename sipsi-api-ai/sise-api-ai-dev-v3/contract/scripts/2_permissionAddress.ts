import NftContractProvider from "../lib/NftContractProvider";
import CollectionConfig from "../config/CollectionConfig";

async function main() {
  if (CollectionConfig.permissionAddress == null) {
    throw ("\x1b[31merror\x1b[0m" + "The address is emty, please add some address to the configuration.");
  }
  // attach to deploy contract
  const contract = await NftContractProvider.getContract();

  if ((await contract.adminBenevolence()) != CollectionConfig.permissionAddress) {

    await contract.setPermissionAddress(CollectionConfig.permissionAddress);
    console.log(`Set permission address to: ${CollectionConfig.permissionAddress}`);

  } else {
    console.log(`Already set to: ${CollectionConfig.permissionAddress}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
