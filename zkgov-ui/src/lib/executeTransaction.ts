import { Addresses } from '@/shared/addresses';
import { simulateContract, writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { config } from "@/lib/config";
import { parseEther } from 'viem'
import { useContractWrite, useContractEvent, useSigner } from 'wagmi';

export const executeTransaction = async (min_bid: any): Promise<any> => {
  const abiPath = require('./abi/BlindAuctionFactory.json');
  // const { request } = await simulateContract(config, {
  //   address: Addresses.BLINDAUCTIONFACTORY,
  //   abi: abiPath,
  //   functionName: 'createBlindAuctionProxy',
  //   args: [Addresses.SEMAPHOREADDRES, min_bid],
  // });
  // console.log("request", request)
  //
  // // Execute the transaction
  // // console.log(config)
  // const txResult = await writeContract(config, request);
  // console.log("txResult", txResult)
  // const { data: signer } = useSigner();
  const [{ data: writeData, loading: writeLoading, error: writeError }, write] =
	  useContractWrite(
		  {
			  addressOrName: Addresses.BLINDAUCTIONFACTORY,
			  contractInterface: abiPath,
			  // signerOrProvider: signer,
		  },
		  'createBlindAuctionProxy'
  );
  console.log("data", writeData)
  console.log("loading", writeLoading)
  console.log("error", writeError)

  // Wait for the transaction block to be mined
  // const txResult = await writeResult.wait();
// const transactionReceipt = await waitForTransactionReceipt(config, {
//   hash: txResult, 
// })
  return txResult;
}
