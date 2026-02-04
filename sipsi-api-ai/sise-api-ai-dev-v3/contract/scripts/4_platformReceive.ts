import NftContractProvider from "../lib/NftContractProvider";
import CollectionConfig from "../config/CollectionConfig";

async function main() {
  if (CollectionConfig.addressPlatform == null) {
    throw (
      "\x1b[31merror\x1b[0m" +
      "The address is emty, please add some address to the configuration."
    );
  }

  if (CollectionConfig.feePlatform == 0) {
    throw (
      "\x1b[31merror\x1b[0m" +
      "The percentage is emty, please add some address to the configuration."
    );
  }
  // attach to deploy contract
  const contract = await NftContractProvider.getContract();

  if ((await contract.platformReceiver()) != CollectionConfig.addressPlatform) {
    await contract.setPlatformReceiver(CollectionConfig.addressPlatform);
    console.log(`Set platform receiver to: ${CollectionConfig.addressPlatform}`);
  } else {
    console.log(`Already set to: ${CollectionConfig.permissionAddress}`);
  }

  if ((await contract.feePlatform()) != BigInt(CollectionConfig.feePlatform)) {
    await contract.setFeePlatform(CollectionConfig.feePlatform);
    console.log(`Set to: ${CollectionConfig.feePlatform}`);
  } else {
    console.log(`Already set to: ${CollectionConfig.feePlatform}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
