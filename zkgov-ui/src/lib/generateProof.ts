import path from "path";
// @ts-ignore
import * as snarkjs from 'snarkjs';
import { Group, Identity, generateProof } from "@semaphore-protocol/core"
const { exportCallDataGroth16, proofToSCFormat } = require("./utils");

export const generateProofs = async (input0: number, groupId: number, maxBid: number, address: string, user): Promise<any> => { 
	console.log(`Generating vote proof with inputs: ${input0}`);
  
  // We need to have the naming scheme and shape of the inputs match the .circom file

	  const inputs = {
	  groupId: groupId,
	  biddingAddress: address,
	  maxBid: maxBid,
	  bid: input0,
	  x: BigInt("1")
	  }

  // Paths to the .wasm file and proving key
  const wasmPath = path.join(process.cwd(), 'zk/ZkGovAuction.wasm');
  const provingKeyPath = path.join(process.cwd(), 'zk/ZkGovAuction_final.zkey')

  try {
    // Generate a proof of the circuit and create a structure for the output signals
	  const proof = await exportCallDataGroth16(
		  inputs,
		  wasmPath,
		  provingKeyPath
	  );
	  const group = new Group();
	  group.addMember(user.commitment);
	  const s_proof = await generateProof(user, group, proof.Input[0], groupId);

	  return {
		  proof: proof, 
		  semaphore_proof: s_proof,
	  }
  } catch (err) {
    console.log(`Error:`, err)
    return {
      proof: [], 
      semaphore_proof: [],
    }
  }
}
