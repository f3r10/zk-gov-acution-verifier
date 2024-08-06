import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { Group, Identity, generateProof } from "@semaphore-protocol/core"
import { expect } from "chai"
import { ethers } from "ethers"
import { run } from "hardhat"
import path from "path";
// @ts-ignore: typechain folder will be generated after contracts compilation
// eslint-disable-next-line
import { BlindAuction, ISemaphore, Groth16Verifier } from "../typechain-types"
import { buildPoseidonOpt as buildPoseidon } from 'circomlibjs';
// import { ethers } from 'ethers';
const { exportCallDataGroth16 } = require("./utils/utils");

function genRandomNumber(numberOfBytes = 31) {
	return ethers.toBigInt(ethers.randomBytes(numberOfBytes));
}

describe("BlindAuction", () => {
    async function deployFeedbackFixture() {
        const { semaphore } = await run("deploy:semaphore", {
            logs: true
        })

        const semaphoreContract: ISemaphore = semaphore

        const {feedbackContract, verifierContract} = await run("deploy", {
            logs: true,
            semaphore: await semaphoreContract.getAddress(),
        })

        const groupId = await feedbackContract.groupId()

        return { semaphoreContract, feedbackContract, groupId, verifierContract }
    }

    describe("# joinGroup", () => {
        it("Should allow users to join the group", async () => {
            const { semaphoreContract, feedbackContract, groupId, _ } = await loadFixture(deployFeedbackFixture)

            const users = [new Identity(), new Identity()]

            const group = new Group()

            for (const [i, user] of users.entries()) {
                const transaction = await feedbackContract.joinGroup(user.commitment)
                group.addMember(user.commitment)

                await expect(transaction)
                    .to.emit(semaphoreContract, "MemberAdded")
                    .withArgs(groupId, i, user.commitment, group.root)
            }
        })
    })

    describe("# bid", () => {
        it("Should allow users to bid", async () => {
            const { semaphoreContract, feedbackContract, groupId, verifierContract } = await loadFixture(deployFeedbackFixture)

            const users = [new Identity(), new Identity(), new Identity(), new Identity()]
            const group = new Group()
            const scope = group.root

	    const revealData = [];
	    let init_bid = 100;
            for (const user of users) {
                await feedbackContract.joinGroup(user.commitment)
                group.addMember(user.commitment)
		const poseidon = await buildPoseidon();
		const blindSecret = genRandomNumber();
		const p = poseidon.F.toString(poseidon([init_bid, blindSecret]))
		// const blindedBid = ethers.getBigInt(p);
		const proof = await generateProof(user, group, p, groupId)
		const transaction =  await feedbackContract.bid(
			proof.merkleTreeDepth,
			proof.merkleTreeRoot,
			proof.nullifier,
			p,
			proof.points
		)
		await expect(transaction)
		.to.emit(semaphoreContract, "ProofValidated")
		.withArgs(
			groupId,
			proof.merkleTreeDepth,
			proof.merkleTreeRoot,
			proof.nullifier,
			proof.message,
			groupId,
			proof.points
		)
		revealData.push([init_bid.toString(), blindSecret.toString()]);
		init_bid = init_bid * 5;
            }
	    console.log("revealData", revealData)


	    const bids = await feedbackContract.getBids();
	    console.log("bids", bids);
	    for (const r of revealData) {
		    console.log("going to insert", r[0].toString())
		    await feedbackContract.reveal_phase(r[0].toString(), r[1].toString())
		    console.log("inserted")
	    }
	    // const r = await feedbackContract.getRevealBids();
	    // console.log("r", r);
	    // const input = {
		   //  blindedBids: bids,
		   //  bids: r,
	    // }
	    // console.log("inputs", input)
					//
	    // const wasmPath = path.join(process.cwd(), 'test/zkproof/highestbidder.wasm');
	    // const provingKeyPath = path.join(process.cwd(), 'test/zkproof/highestbidder_final.zkey');
	    // let dataResult = await exportCallDataGroth16(
		   //  input,
		   //  wasmPath,
		   //  provingKeyPath
	    // );
	    // console.log("dataResult", dataResult)
	    // let result = await feedbackContract.getHighestBidder(
		   //  dataResult.a,
		   //  dataResult.b,
		   //  dataResult.c,
		   //  dataResult.Input
	    // );
	    // console.log("result", result)
	    // let asd = await feedbackContract.ghighestBidder()
	    // console.log("asd", asd)
	    


	    // await expect(bids).to.include(blindedBid)
        })
    })
})
