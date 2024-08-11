import { ethers } from "hardhat"

async function main() {
    // const verifierFactory = await ethers.deployContract("Groth16Verifier")
    // await verifierFactory.waitForDeployment()
    // console.log("verifierFactory Contract deployed to:", verifierFactory.target)

    const semaphoreAddres = "0x1e0d7FF1610e480fC93BdEC510811ea2Ba6d7c2f" as `0x${string}`;
    const verifierAddress = "0xdF0317206B79370a3ACE50dd9D4cE508Ae14E60c" as `0x${string}`;

    const blindAuction = await ethers.deployContract("BlindAuction", [])
    await blindAuction.waitForDeployment()
    console.log("blindAuction Contract deployed to:", blindAuction.target)

    const blindAuctionFactory = await ethers.deployContract("BlindAuctionFactory", [blindAuction.target, verifierAddress, semaphoreAddres])
    await blindAuctionFactory.waitForDeployment()
    console.log("blindAuctionFactory Contract deployed to:", blindAuctionFactory.target)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

// verifierFactory Contract deployed to: 0xdF0317206B79370a3ACE50dd9D4cE508Ae14E60c
// blindAuction Contract deployed to: 0x979C14AFcD29Eeb84C89bc7f8A6EB201E70E1F3C
// blindAuctionFactory Contract deployed to: 0x405791fa9fE91040aE9b6084Ea24cD3d7F613fa5
