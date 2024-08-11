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
import axios, { AxiosRequestConfig } from 'axios';
import { readContract } from '@wagmi/core';

export default function AuctionDetail({ params }: { params: { slug: string } }) {
  const [auction, setAuction] = useState(undefined);
  const [currentCommitents, setCurrentCommitents] = useState([]);
  const [input0, setInput0] = useState("");
  const [input1, setInput1] = useState("");
  const [maxBid, setMaxBid] = useState(undefined);
  const [groupId, setGroupId] = useState(undefined);
  const { writeContract } = useWriteContract();
  const blindAuctionFactoryAddress = Addresses.BLINDAUCTIONFACTORY;
  const id  = params.id;
  const { data: address, refetch } = useReadContract({
    address: blindAuctionFactoryAddress,
    abi: blindAuctionFactoryAbi.abi,
    functionName: "getAuctionById",
    args: [id],
  });
  if (address != undefined) {
  const getMaxBid = async () => {
  let maxBid = await readContract(config, {
    address: address,
    abi: blindAuctionAbi.abi,
    functionName: "getMaxBid",
    args: [],
  });
  console.log("maxBid", maxBid)
  setMaxBid(maxBid.toString())
  }
  getMaxBid()
  const getGroupId = async () => {
  let groupId = await readContract(config, {
    address: address,
    abi: blindAuctionAbi.abi,
    functionName: "groupId",
    args: [],
  });
  console.log("groupId", groupId)
  setGroupId(groupId.toString())
  }
getGroupId()
  } else {

  console.log("address todavia empty")
  }

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

const generateProof = async () => {
	  const provider = new ethers.BrowserProvider(window.ethereum);
	  let message = "message";
	  const signer = await provider.getSigner();
	  const signature = await signer.signMessage(message);
	  // const groupId = groupId;
	  // const maxBid = maxBid;
	  const addressSigner = await signer.getAddress();
	  const data = {
	  input0: input0,
	  groupId: groupId,
	  maxBid: maxBid,
	  address: addressSigner,
	  signature: signature
	  }
	  console.log("data", data)
    const configAxios: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/json",
      }
    }
	  try {

      const res = await axios.post("/api/generate_proof", data, configAxios);
      console.log("res", res);
      const args = [BigInt(res.data.semaphore_proof.merkleTreeDepth).toString(), 
	res.data.semaphore_proof.merkleTreeRoot, 
	res.data.semaphore_proof.nullifier, 
	res.data.semaphore_proof.points, 
	res.data.proof.a, 
	res.data.proof.b, 
	res.data.proof.c, 
	res.data.proof.Input];
	console.log("args", args)

	  const a = await writeContract({
	address: address,
	abi: blindAuctionAbi.abi,
	functionName: "bid",
	args: args,
	});
	console.log("response", a)
	  } catch (err: any) {
    console.log("err", err)
      const statusCode = err?.response?.status;
      console.log("statusCode", statusCode)
      const errorMsg = err?.response?.data?.error;
      console.log("errorMsg", errorMsg)
    }
}


const revealBid = async () => {
	  const provider = new ethers.BrowserProvider(window.ethereum);
	  const signer = await provider.getSigner();
	  // const groupId = groupId;
	  // const maxBid = maxBid;
	  const addressSigner = await signer.getAddress();
	  const data = {
	  input1: input1,
	  groupId: groupId,
	  maxBid: maxBid,
	  address: addressSigner 
	  }
	  console.log("data", data)
    const configAxios: AxiosRequestConfig = {
      headers: {
        "Content-Type": "application/json",
      }
    }
	  try {

      const res = await axios.post("/api/generate_proof_for_reveal_bid", data, configAxios);
      console.log("res", res);
      const args = [res.data.proof.a, 
	res.data.proof.b, 
	res.data.proof.c, 
	res.data.proof.Input];
	console.log("args", args)

	  const a = await writeContract({
	address: address,
	abi: blindAuctionAbi.abi,
	functionName: "revealBid",
	args: args,
	});
	console.log("response", a)
	  } catch (err: any) {
    console.log("err", err)
      const statusCode = err?.response?.status;
      console.log("statusCode", statusCode)
      const errorMsg = err?.response?.data?.error;
      console.log("errorMsg", errorMsg)
    }
}

 const fetchCommitments = async () => {
 console.log("address", address)
  let bids = await readContract(config, {
    address: address,
    abi: blindAuctionAbi.abi,
    functionName: "getBids",
    args: [],
  });
  bids = bids.map(a => a.toString());
  console.log("bids", bids[0])
    setCurrentCommitents(bids);
 };

 const createGroup = async () => {
 console.log("address", address)
	  const a = await writeContract({
	address: address,
	abi: blindAuctionAbi.abi,
	functionName: "createGroup",
	args: [],
	});
	console.log("response", a)
 };


 useEffect(() => {
      setAuction(address);
  }, [address]);
  return (
  <div>
  <p> 
  Auction Address: {auction}
  </p>
  <p>
  <span>MaxBid: {maxBid}</span>
  </p>
  <p>
  <span>GroupId: {groupId}</span>
  </p>
  <p>
  <button
  type="button"
  className="mt-5 w-full py-2 bg-gray-600 text-white font-bold rounded transition duration-300 ease-in-out transform hover:scale-105 mb-3"
  onClick={joinGroupSemaphore} > Unirme al grupo de semaphore  </button>
  </p>
  <p>
  <button
  type="button"
  className="mt-5 w-full py-2 bg-gray-600 text-white font-bold rounded transition duration-300 ease-in-out transform hover:scale-105 mb-3"
  onClick={createGroup} > Crear grupo  </button>
  </p>

  <p>
      <input
                      placeholder="" 
                      value={input0} 
                      onChange={(e) => setInput0(e.currentTarget.value)}
      />
  <button
  type="button"
  className="mt-5 w-full py-2 bg-gray-600 text-white font-bold rounded transition duration-300 ease-in-out transform hover:scale-105 mb-3"
  onClick={generateProof} > Generare proof  </button>
  </p>

  <div>

  <button
  type="button"
  className="mt-5 w-full py-2 bg-gray-600 text-white font-bold rounded transition duration-300 ease-in-out transform hover:scale-105 mb-3"
  onClick={() => fetchCommitments()} > obtener commitments  </button>
  <div> {currentCommitents.map((a, index) => <p> {index}: {a}</p>)} </div>
  </div>



  <p>
      <input
                      placeholder="" 
                      value={input1} 
                      onChange={(e) => setInput1(e.currentTarget.value)}
      />
  <button
  type="button"
  className="mt-5 w-full py-2 bg-gray-600 text-white font-bold rounded transition duration-300 ease-in-out transform hover:scale-105 mb-3"
  onClick={revealBid} > Revelar Oferta  </button>
  </p>

  </div>);
};
