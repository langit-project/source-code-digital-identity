import { createWalletClient, createPublicClient, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { localhost } from "viem/chains";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
const panteraPrivateKey = process.env.PANTERA_PRIVATE_KEY;
const majelisPrivateKey = process.env.MAJELIS_PRIVATE_KEY;

if (!adminPrivateKey || !panteraPrivateKey || !majelisPrivateKey) {
  throw new Error(
    "One or more private keys are missing in environment variables"
  );
}

const adminKey = privateKeyToAccount(adminPrivateKey as Address);
const panteraKey = privateKeyToAccount(panteraPrivateKey as Address);
const majelisKey = privateKeyToAccount(majelisPrivateKey as Address);

export const admin = createWalletClient({
  account: adminKey,
  chain: localhost,
  transport: http("http://hardhat:8545"), // Use the Docker service name
});

export const pantera = createWalletClient({
  account: panteraKey,
  chain: localhost,
  transport: http("http://hardhat:8545"), // Use the Docker service name
});

export const majelis = createWalletClient({
  account: majelisKey,
  chain: localhost,
  transport: http("http://hardhat:8545"), // Use the Docker service name
});

export const publicClient = createPublicClient({
  chain: localhost,
  transport: http("http://hardhat:8545"),
});

// Function to get ABI for a contract
function getAbi() {
  const abiPath = path.resolve(
    __dirname,
    "../../artifacts/contracts/SengketaContract.sol/SengketaContract.json"
  );
  const abiFile = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  return abiFile.abi;
}

export const sengketAbi = getAbi();
export const sengketaContractAddress = process.env.SMART_CONTRACT_ADDRESS;
