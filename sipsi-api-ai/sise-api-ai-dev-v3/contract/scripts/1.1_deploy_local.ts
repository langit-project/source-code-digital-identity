import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import CollectionConfig from "../config/CollectionConfig";
import { NftContractType } from "../lib/NftContractProvider";
import ContractArguments from "../config/ContractArguments";

async function main() {
  console.log("Deploying contract...");
  // We get the contract to deploy
  const Contract = await ethers.getContractFactory(
    CollectionConfig.contractName
  );
  const contract = (await Contract.deploy(
    ...ContractArguments
  )) as unknown as NftContractType;
  await contract.waitForDeployment();

  const contract_address = await contract.getAddress();
  console.log("Contract deployed to:", contract_address);

  // Update .env file in rest-api directory
  const envPath = path.resolve(__dirname, "../../rest-api/.env");

    // Check if .env file exists, if not create it
    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, '');
    }
    
  let envContent = fs.readFileSync(envPath, "utf8");

  // Append the contract address
  envContent += `\nSMART_CONTRACT_ADDRESS=${contract_address}\n`;

  fs.writeFileSync(envPath, envContent, "utf8");
  console.log("Contract address saved to .env file in rest-api directory");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
