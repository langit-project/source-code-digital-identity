import { ethers } from "hardhat";
import CollectionConfig from "../config/CollectionConfig";
import { NftContractType } from "../lib/NftContractProvider";
import ContractArguments from "../config/ContractArguments";

async function main() {
  console.log("Deploying contract..");

  // We get the contract to deploy
  const Contract = await ethers.getContractFactory(
    CollectionConfig.contractName
  );
  const contract = (await Contract.deploy(
    ...ContractArguments
  )) as unknown as NftContractType;
  await contract.waitForDeployment();

  // only get proxy contract, need to know where is contract ompelemntation
  console.log("Contract proxy:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
