//SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import "poseidon-solidity/PoseidonT3.sol";

interface IVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[6] memory input
    ) external view returns (bool);
}

contract BlindAuction {
    ISemaphore public semaphore;

    uint256 public groupId;
    // keeps track of all blinded bids that will be retrieved by auctioneer
    uint256[] public bids;
    // uint256[] public revealedBid;
// contract address of our circuit verifier
    address public verifierContractAddress;
address public highestBidder;
    uint256 public highestBid;
// blindedbids => bidders
    mapping(address => uint256) public hashedBidsToBidders;

    struct BidInfo{
	    address bidder;
	    uint256 bid;
    }
    BidInfo[] public revealedBid;

    address winner;
    bool winnerRevealed;
    uint256 finalBid;


    constructor(address semaphoreAddress, address _verifierAddress) {
        semaphore = ISemaphore(semaphoreAddress);

        groupId = semaphore.createGroup();
	verifierContractAddress = _verifierAddress;
    }

    function joinGroup(uint256 identityCommitment) external {
        semaphore.addMember(groupId, identityCommitment);
    }

    /// Place a blinded bid with `blindedBid` =
    /// Poseidon(value, secret, address))
    function bid(
        uint256 merkleTreeDepth,
        uint256 merkleTreeRoot,
        uint256 nullifier,
        uint256[8] calldata points,
        uint256[2] memory _proof_a,
        uint256[2][2] memory _proof_b,
        uint256[2] memory _proof_c,
	uint256[6] memory inputs
    ) external {
        ISemaphore.SemaphoreProof memory proof = ISemaphore.SemaphoreProof(
            merkleTreeDepth,
            merkleTreeRoot,
            nullifier,
            inputs[0],
            groupId,
            points
        );

        semaphore.validateProof(groupId, proof);
	if (!IVerifier(verifierContractAddress).verifyProof(_proof_a, _proof_b, _proof_c, inputs)) {
		revert("Proof failed");
	}
	hashedBidsToBidders[msg.sender] = inputs[0];
        bids.push(inputs[0]);
    }
 function revealBid(
    uint256[2] memory _proof_a,
    uint256[2][2] memory _proof_b,
    uint256[2] memory _proof_c,
    uint256[6] memory inputs
  ) external {

    if (
      !IVerifier(verifierContractAddress).verifyProof(
        _proof_a,
        _proof_b,
        _proof_c,
	inputs
      )
    ) {
      revert();
    }
    uint256 prevY = hashedBidsToBidders[msg.sender];
    uint256 a1;
    unchecked {a1 = inputs[0] - prevY;}
    uint256 a0; 
    unchecked {a0 = prevY - a1;}
    // store everyones bid;
    revealedBid.push(BidInfo(msg.sender, a0));
    // revealed[msg.sender] = true;
  }

function revealWinner() external {
    // if (block.timestamp < revealDue) revert();
    uint256 _max = revealedBid[0].bid;
    address _winner;
    for (uint256 i = 1; i < revealedBid.length; ) {
      if (revealedBid[i].bid < _max) {
        _max = revealedBid[i].bid;
        _winner = revealedBid[i].bidder;
      }
      unchecked {
        i++;
      }
    }
    finalBid = _max;
    winner = _winner;
    winnerRevealed = true;
  }

 function getBids()
        external
        view
        returns (uint256[] memory)
    {
        return bids;
    }
 function bidWinner()
        external
        view
        returns (uint256)
    {
        return finalBid;
    }
}
