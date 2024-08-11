"use client"
import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
import { Addresses } from '@/shared/addresses';
import blindAuctionFactoryAbi from '../../../lib/abi/BlindAuctionFactory.json';
import blindAuctionAbi from '../../../lib/abi/BlindAuction.json';
import { useReadContract, useWriteContract } from 'wagmi';
import { config } from "@/lib/config";
import { Group, Identity, generateProof } from "@semaphore-protocol/core"
const ethers = require("ethers")

export default function AuctionDetail({ params }: { params: { slug: string } }) {
  const [auction, setAuction] = useState(undefined);
  const { writeContract } = useWriteContract();
  const blindAuctionFactoryAddress = Addresses.BLINDAUCTIONFACTORY;
  const id  = params.id;
  console.log("-----------id", params.id);
  const { data: address, refetch } = useReadContract({
    address: blindAuctionFactoryAddress,
    abi: blindAuctionFactoryAbi.abi,
    functionName: "getAuctionById",
    args: [id],
  });

  const joinGroupSemaphore = async () => {
  console.log("joinGroupSemaphore")
  try {

	  const provider = new ethers.BrowserProvider(window.ethereum);
	  let message = "message";
	  const signer = await provider.getSigner();
	  const signature = await signer.signMessage(message);
	  const user = new Identity(signature)

	  console.log("address", user.commitment);

	  const a = await writeContract({
	address: address,
	abi: blindAuctionAbi.abi,
	functionName: "joinGroup",
	args: [user.commitment],
	});
	console.log("response", a)
  } catch (err: any) {
    console.log("err", err)
      const statusCode = err?.response?.status;
      console.log("statusCode", statusCode)
      const errorMsg = err?.response?.data?.error;
      console.log("errorMsg", errorMsg)
    }


};

 useEffect(() => {
      setAuction(address);
  }, [address]);
  return (
  <div>
  <p> 
  Auction Address: {auction}
  </p>
  <button
  type="button"
  className="mt-5 w-full py-2 bg-gray-600 text-white font-bold rounded transition duration-300 ease-in-out transform hover:scale-105 mb-3"
  onClick={joinGroupSemaphore} > Unirme al grupo de semaphore  </button>
  </div>);
};
