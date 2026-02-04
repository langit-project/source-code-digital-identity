import NftContractProvider from "../lib/NftContractProvider";
import CollectionConfig from "../config/CollectionConfig";

async function main() {
  const lenghtContractPayment = CollectionConfig.contractPayment.length;
  if (lenghtContractPayment < 1) {
    throw (
      "\x1b[31merror\x1b[0m" +
      "The whitelist is emty, please add some address to the configuration."
    );
  }
  // attach to deploy contract
  const contract = await NftContractProvider.getContract();

  for (let i = 0; i < lenghtContractPayment; i++) {
    await contract.approveTokenPayment(CollectionConfig.contractPayment[i]);
    console.log(
      `Set allowed payment to: ${CollectionConfig.contractPayment[i]}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
