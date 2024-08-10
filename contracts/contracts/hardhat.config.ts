import "@nomicfoundation/hardhat-toolbox"
import "@semaphore-protocol/hardhat"
import "@openzeppelin/hardhat-upgrades";
import { getHardhatNetworks } from "@semaphore-protocol/utils"
import { config as dotenvConfig } from "dotenv"
import { HardhatUserConfig } from "hardhat/config"
import { resolve } from "path"
import "./tasks/deploy"
require("hardhat-gas-reporter");

dotenvConfig({ path: resolve(__dirname, "../../.env") })
require("dotenv").config();

const config: HardhatUserConfig = {
    solidity: "0.8.23",
    settings: {
	    optimizer: {
		    enabled: true,
		    runs: 200,
	    },
    },
    defaultNetwork: process.env.DEFAULT_NETWORK || "hardhat",
    networks: {
        hardhat: {
            chainId: 1337
        },
        ...getHardhatNetworks(process.env.ETHEREUM_PRIVATE_KEY)
    },
    gasReporter: {
        currency: "USD",
        enabled: process.env.REPORT_GAS === "true",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY
    },
    typechain: {
        target: "ethers-v6"
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
    },
    sourcify: {
        enabled: true
    },
    networks: {
	    sepolia: {
		    url: "https://rpc.sepolia.org/",
		    accounts: [process.env.PRIVATE_KEY],
	    },
	    mumbai: {
		    url: "https://rpc-mumbai.maticvigil.com",
		    accounts: [process.env.PRIVATE_KEY],
	    },
    },
}

export default config

