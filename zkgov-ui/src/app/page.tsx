"use client"
import Image from "next/image";

import { ConnectBtn } from "./components/connectButton";
// import { CreateAuctionComponent } from "./components/createAuction";
import blindAuctionFactoryAbi from '../lib/abi/BlindAuctionFactory.json';
import { useReadContract, useWriteContract } from 'wagmi';
import { Addresses } from '@/shared/addresses';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
 const [auctions, setAuctions] = useState([]);
const { writeContract } = useWriteContract();
  const [input0, setInput0] = useState("");
  // const provider = useProvider();
  // const [signer] = useSigner();
  const blindAuctionFactoryAddress = Addresses.BLINDAUCTIONFACTORY;
  const { data: allAuctions, refetch } = useReadContract({
    address: blindAuctionFactoryAddress,
    abi: blindAuctionFactoryAbi.abi,
    functionName: "getAllAuctions"
    // signerOrProvider: signer.data,
  });
  const createAuction = async () => {
  console.log("createAuction")
  try {

	  const a = await writeContract({
	address: Addresses.BLINDAUCTIONFACTORY,
	abi: blindAuctionFactoryAbi.abi,
	functionName: "createBlindAuctionProxy",
	args: [BigInt(input0)],
	})
	console.log("response", a)
  } catch (err: any) {
    console.log("err", err)
      const statusCode = err?.response?.status;
      console.log("statusCode", statusCode)
      const errorMsg = err?.response?.data?.error;
      console.log("errorMsg", errorMsg)
    }


};



const AuctionsList = ({au = []}) => {
return (<div> {au.map((a, index) => <Link href={`/auctions/${index}`}> {a} </Link>)} </div>)
};

useEffect(() => {
   setAuctions(allAuctions)
  }, [allAuctions]);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <ConnectBtn />
      </div>
<div className="grid w-full grid-cols-2 gap-4">
<AuctionsList au={auctions}/>
</div>
<div className="max-w-md w-full space-y-8 p-10 bg-gray-800 shadow-2xl rounded-lg">

      <input
                      placeholder="" 
                      value={input0} 
                      onChange={(e) => setInput0(e.currentTarget.value)}
      />
				<button
					type="button"
					className="mt-5 w-full py-2 bg-gray-600 text-white font-bold rounded transition duration-300 ease-in-out transform hover:scale-105 mb-3"
					onClick={createAuction} > Crear oferta  </button>
			</div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
      </div>
    </main>
  );
}
