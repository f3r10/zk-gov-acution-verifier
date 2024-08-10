import { task, types } from "hardhat/config"

task("deploy", "Deploy a Feedback contract")
    .addOptionalParam("semaphore", "Semaphore contract address", undefined, types.string)
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs, semaphore: semaphoreAddress}, { ethers, run }) => {
        if (!semaphoreAddress) {
            const { semaphore } = await run("deploy:semaphore", {
                logs
            })

            semaphoreAddress = await semaphore.getAddress()
        }

        const FeedbackFactory = await ethers.getContractFactory("BlindAuction")
	const VerifierFactory = await ethers.getContractFactory("Groth16Verifier")
	const verifierContract = await VerifierFactory.deploy()

        const feedbackContract = await FeedbackFactory.deploy(verifierContract.getAddress())

        if (logs) {
            console.info(`Feedback contract has been deployed to: ${await feedbackContract.getAddress()}`)
	    console.info(`Verifier contract has been deployed to: ${await verifierContract.getAddress()}`)
        }

        return {feedbackContract, verifierContract}
    })
