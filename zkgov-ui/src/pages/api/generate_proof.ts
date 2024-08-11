import { generateProofs } from '@/lib/generateProof';
import type { NextApiRequest, NextApiResponse } from 'next'
import { Group, Identity, generateProof } from "@semaphore-protocol/core"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const body = req?.body;
  if (body === undefined) {
    return res.status(403).json({error: "Request has no body"});
  }
  console.log(body);

  const input0 = BigInt(body.input0);
  const groupId = BigInt(body.groupId);
  const maxBid = BigInt(body.maxBid);
  const address = body.address;

  if (input0 === undefined || Number.isNaN(input0)) {
    return res.status(403).json({error: "Invalid inputs"});
  }

  const user = new Identity(body.signature)
  const proof = await generateProofs(input0, groupId, maxBid, address, user);
  console.log("proof", proof)

  if (proof.proof === "") {
    return res.status(403).json({error: "Proving failed"});
  }

  res.setHeader("Content-Type", "text/json");
  res.status(200).json(proof);
}
