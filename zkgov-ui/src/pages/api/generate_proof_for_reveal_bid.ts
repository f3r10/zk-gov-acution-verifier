import { generateProofForReveal } from '@/lib/generateProofForReveal';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const body = req?.body;
  if (body === undefined) {
    return res.status(403).json({error: "Request has no body"});
  }
  console.log(body);

  const input1 = BigInt(body.input1);
  const groupId = BigInt(body.groupId);
  const maxBid = BigInt(body.maxBid);
  const address = body.address;

  if (input1 === undefined || Number.isNaN(input1)) {
    return res.status(403).json({error: "Invalid inputs"});
  }

  const proof = await generateProofForReveal(input1, groupId, maxBid, address);
  console.log("proof", proof)

  if (proof.proof === "") {
    return res.status(403).json({error: "Proving failed"});
  }

  res.setHeader("Content-Type", "text/json");
  res.status(200).json(proof);
}
