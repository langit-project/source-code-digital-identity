require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const { PRIVATE_KEY, POLYGON_MAINNET_RPC, POLYGONSCAN_API_KEY } = process.env;

module.exports = {
  solidity: "0.8.28",
  networks: {
    polygonMainnet: {
      url: POLYGON_MAINNET_RPC,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      polygon: POLYGONSCAN_API_KEY,
    },
  },
};
