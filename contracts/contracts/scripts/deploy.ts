import { ethers } from "hardhat"

async function main() {
    const verifierFactory = await ethers.deployContract("Groth16Verifier")
    await verifierFactory.waitForDeployment()
    console.log("verifierFactory Contract deployed to:", verifierFactory.target)

    const semaphoreAddres = "0x1e0d7FF1610e480fC93BdEC510811ea2Ba6d7c2f" as `0x${string}`;

    const blindAuction = await ethers.deployContract("BlindAuction", [semaphoreAddres, verifierFactory.target])
    await blindAuction.waitForDeployment()
    console.log("blindAuction Contract deployed to:", blindAuction.target)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})

// verifierFactory Contract deployed to: 0x5F3eA2F94ACb242413AB33338F557106A1F7F4aF
// blindAuction Contract deployed to: 0x6F8A71C1cA28dAD2969d3C74B377896817551Db0
