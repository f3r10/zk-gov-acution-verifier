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
const { exportCallDataGroth16, proofToSCFormat } = require("./utils/utils");

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

            const users = [new Identity()/* , new Identity(), new Identity(), new Identity() */]
            const group = new Group()
            const scope = group.root

	    const revealData = [];
	    let init_bid = 100;
	    let maxBid = 100000;

	    const wasmPath = path.join(process.cwd(), 'test/zkproof/ZkGovAuction.wasm');
	    const provingKeyPath = path.join(process.cwd(), 'test/zkproof/ZkGovAuction_final.zkey');
            for (const user of users) {
                await feedbackContract.joinGroup(user.commitment)
                group.addMember(user.commitment)
		// const poseidon = await buildPoseidon();
		const blindSecret = genRandomNumber();
		// const p = poseidon.F.toString(poseidon([init_bid, blindSecret]))
		// const blindedBid = ethers.getBigInt(p);
		const input = {
			bid: init_bid,
			biddingAddress: BigInt("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
			key: blindSecret,
			groupId : groupId,
			maxBid: BigInt(maxBid)
		};
		console.log("input", input)
		const proof_2 = await exportCallDataGroth16(
			input,
			wasmPath,
			provingKeyPath
		);
		console.log("proof_2", proof_2)
		const proof = await generateProof(user, group, proof_2.Input[0], groupId)
		// const a = await verifierContract.verifyProof(proof_2.a, proof_2.b, proof_2.c, proof_2.pub)
		
		// console.log("a", a);
		
		const transaction =  await feedbackContract.bid(
			proof.merkleTreeDepth,
			proof.merkleTreeRoot,
			proof.nullifier,
			proof.points,
			proof_2.a,
			proof_2.b,
			proof_2.c,
			proof_2.Input

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
			proof.points,
		)

		// const input2 = {
		// 	bid: init_bid,
		// 	biddingAddress: BigInt("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
		// 	groupId : groupId,
		// 	x: BigInt(2)
		// };
		// const proof_3 = await proofToSCFormat(
		// 	input2,
		// 	wasmPath,
		// 	provingKeyPath
		// );
		// const transaction2 =  await feedbackContract.revealBid(
		// 	proof_3.a,
		// 	proof_3.b,
		// 	proof_3.c,
		// 	proof_3.pub
		//
		// )
		// revealData.push([init_bid.toString(), blindSecret.toString()]);
		init_bid = init_bid * 5;
            }
	    // console.log("revealData", revealData)


	    const bids = await feedbackContract.getBids();
	    console.log("bids", bids);

	    const rbids = await feedbackContract.getRevealBids();
	    console.log("rbids", rbids);
	    // for (const r of revealData) {
		   //  console.log("going to insert", r[0].toString())
		   //  await feedbackContract.reveal_phase(r[0].toString(), r[1].toString())
		   //  console.log("inserted")
	    // }
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
