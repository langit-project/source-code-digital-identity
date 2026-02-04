import fs from "fs";
import * as dotenv from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import CollectionConfig from "./config/CollectionConfig";

dotenv.config();
const DEFAULT_GAS_MULTIPLIER: number = 1;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});
task(
  "rename-contract",
  "Renames the smart contract replacing all occurrences in source files",
  async (taskArgs: { newName: string }, hre) => {
    // Validate new name
    if (!/^([A-Z][A-Za-z0-9]+)$/.test(taskArgs.newName)) {
      throw "The contract name must be in PascalCase: https://en.wikipedia.org/wiki/Camel_case#Variations_and_synonyms";
    }

    const oldContractFile = `${__dirname}/contracts/${CollectionConfig.contractName}.sol`;
    const newContractFile = `${__dirname}/contracts/${taskArgs.newName}.sol`;

    if (!fs.existsSync(oldContractFile)) {
      throw `Contract file not found: "${oldContractFile}" (did you change the configuration manually?)`;
    }

    if (fs.existsSync(newContractFile)) {
      throw `A file with that name already exists: "${oldContractFile}"`;
    }

    // Replace names in source files
    replaceInFile(
      __dirname + "/config/CollectionConfig.ts",
      CollectionConfig.contractName,
      taskArgs.newName
    );
    replaceInFile(
      __dirname + "/lib/NftContractProvider.ts",
      CollectionConfig.contractName,
      taskArgs.newName
    );
    replaceInFile(
      oldContractFile,
      CollectionConfig.contractName,
      taskArgs.newName
    );

    // Rename the contract file
    fs.renameSync(oldContractFile, newContractFile);

    console.log(
      `Contract renamed successfully from "${CollectionConfig.contractName}" to "${taskArgs.newName}"!`
    );

    // Rebuilding types
    await hre.run("typechain");
  }
).addPositionalParam("newName", "The new name");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
        // yulDetails: {
        //   optimizerSteps: "u",
        // },
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: [
        {
          privateKey: process.env.ADMIN_PRIVATE_KEY!,
          balance: "1000000000000000000000",
        },
        {
          privateKey: process.env.PANTERA_PRIVATE_KEY!,
          balance: "1000000000000000000000",
        },
        {
          privateKey: process.env.MAJELIS_PRIVATE_KEY!,
          balance: "1000000000000000000000",
        },
        {
          privateKey:
            "0x4c0883a6910395b0c7aeb47b00d944fb16a4f6e9dbf4ab8cb1d5df78a0d5c984", // dummy private key
          balance: "1000000000000000000000",
        },
        {
          privateKey:
            "0x7a28ef2024c092ba0c4d5962f4cdd0e0b7d17d8ef892e27e21fb98e4e5f04a4e", // dummy private key
          balance: "1000000000000000000000",
        },
      ],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: [
        process.env.ADMIN_PRIVATE_KEY!,
        process.env.PANTERA_PRIVATE_KEY!,
        process.env.MAJELIS_PRIVATE_KEY!,
      ],
    },
    truffle: {
      url: "http://localhost:24012/rpc",
      timeout: 60000,
      gasMultiplier: DEFAULT_GAS_MULTIPLIER,
    },
  },
  gasReporter: {
    // enabled: process.env.REPORT_GAS ? true : false,
    enabled: true,
    currency: "USD",
    token: "MATIC",
    coinmarketcap: process.env.GAS_REPORTER_COIN_MARKET_CAP_API_KEY,
    // outputFile : 'gass-report.txt',
  },
  etherscan: {
    apiKey: {
      // Ethereum
      // goerli: process.env.BLOCK_EXPLORER_API_KEY_ETHEREUM!,
      // sepolia: process.env.BLOCK_EXPLORER_API_KEY!,
      // rinkeby: process.env.BLOCK_EXPLORER_API_KEY!,
      // ethereum: process.env.BLOCK_EXPLORER_API_KEY_ETHEREUM!,
      // Polygon
      polygon: process.env.BLOCK_EXPLORER_API_KEY_POLYGON!,
      amoy: process.env.BLOCK_EXPLORER_API_KEY_POLYGON!,
      // Arbitrum
      // arbitrumGoerli: process.env.BLOCK_EXPLORER_API_KEY!,
      // arbitrumOne: process.env.BLOCK_EXPLORER_API_KEY!,
    },
    customChains: [
      {
        network: "amoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};

// Setup "testnet" network
if (process.env.NETWORK_TESTNET_POLYGON !== undefined) {
  config.networks!.testnet = {
    url: process.env.NETWORK_TESTNET_POLYGON,
    accounts: [process.env.NETWORK_TESTNET_POLYGON_PRIVATE_KEY!],
    gasMultiplier: DEFAULT_GAS_MULTIPLIER,
  };
}

// Setup "mainnet" network
if (process.env.NETWORK_MAINNET_POLYGON !== undefined) {
  config.networks!.mainnet = {
    url: process.env.NETWORK_MAINNET_POLYGON,
    accounts: [process.env.NETWORK_MAINNET_POLYGON_PRIVATE_KEY!],
    gasMultiplier: DEFAULT_GAS_MULTIPLIER,
  };
}

export default config;

/**
 * Replaces all occurrences of a string in the given file.
 */
function replaceInFile(file: string, search: string, replace: string): void {
  const fileContent = fs
    .readFileSync(file, "utf8")
    .replace(new RegExp(search, "g"), replace);

  fs.writeFileSync(file, fileContent, "utf8");
}
