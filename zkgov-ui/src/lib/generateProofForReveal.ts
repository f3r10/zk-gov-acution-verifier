import path from "path";
// @ts-ignore
import * as snarkjs from 'snarkjs';
const { exportCallDataGroth16, proofToSCFormat } = require("./utils");

export const generateProofForReveal = async (input1: number, groupId: number, maxBid: number, address: string): Promise<any> => { 
	console.log(`Generating vote proof with inputs: ${input1}`);
  
  // We need to have the naming scheme and shape of the inputs match the .circom file

	  const inputs = {
	  groupId: groupId,
	  biddingAddress: address,
	  maxBid: maxBid,
	  bid: input1,
	  x: BigInt("2")
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

	  return {
		  proof: proof, 
	  }
  } catch (err) {
    console.log(`Error:`, err)
    return {
      proof: [], 
    }
  }
}
