* in the circuits folder execute `yarn install`
* in the circuits folder create folder build `mkdir build`
* in the circuits folder execute ./circuits/auction/executeGroth16.sh
* in the circuits/auction execute `yarn test` to check that everything is ok
* in the contract/contracts folder execute `yarn install`
* on the contracts/contracts folder execute `cp ../../circuits/auction/build/ZkGovAuctionVerifier.sol contracts/`
* on the contracts/contracts folder execute `cp ../../circuits/auction/build/ZkGovAuction_js/ZkGovAuction.wasm test/zkproof/`
* on the contracts/contracts folder execute `cp ../../circuits/auction/build/ZkGovAuction_final.zkey test/zkproof/`
* on the contracts/contracts folder execute `hardhat compile`
* on the contracts/contracts folder execute `hardhat test`
