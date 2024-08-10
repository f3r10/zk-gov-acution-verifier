import { ethers } from "hardhat"

async function main() {
    const verifierFactory = await ethers.deployContract("Groth16Verifier")
    await verifierFactory.waitForDeployment()
    console.log("verifierFactory Contract deployed to:", verifierFactory.target)

    // const semaphoreAddres = "0x1e0d7FF1610e480fC93BdEC510811ea2Ba6d7c2f" as `0x${string}`;

    const blindAuction = await ethers.deployContract("BlindAuction", [])
    await blindAuction.waitForDeployment()
    console.log("blindAuction Contract deployed to:", blindAuction.target)

    const blindAuctionFactory = await ethers.deployContract("BlindAuctionFactory", [blindAuction.target, verifierFactory.target])
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
// blindAuction Contract deployed to: 0xe03db36efAf629fC014E70ABE803A50A1a52fc09
// blindAuctionFactory Contract deployed to: 0x2b51a567E6203Dea37bee1d2627209e3c212FB71
