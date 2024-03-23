import path from "node:path";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env") });

const { SEP_URL, ETHER_SCAN_API_KEY, SEPOLIA_PRIVATE_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      forking: {
        url: SEP_URL!,

        blockNumber: parseInt("5536355"),
      },
    },
    sepolia: {
      url: SEP_URL,
      accounts: [SEPOLIA_PRIVATE_KEY!],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHER_SCAN_API_KEY,
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true,
  },
};

export default config;
// Q5X7MP214CVDQXHR6PMW65A525GJ97NZ5U
