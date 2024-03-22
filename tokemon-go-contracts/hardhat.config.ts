import path from "node:path";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env") });

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      forking: {
        url: process.env.SEP_URL,
        blockNumber: parseInt("5536355"),
      },
    },
  },
};

export default config;
