import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();
let SEP_URL = process.env.SEP_URL;
const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      forking: {
        url: SEP_URL!,
        blockNumber: parseInt("5536355"),
      },
    },
  },
};

export default config;
