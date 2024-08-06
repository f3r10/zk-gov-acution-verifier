//SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

interface IVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[10] memory input
    ) external view returns (bool);
}

contract BlindAuction {
    ISemaphore public semaphore;

    uint256 public groupId;
    // keeps track of all blinded bids that will be retrieved by auctioneer
    bytes32[] public bids;
// contract address of our circuit verifier
    address public verifierContractAddress;
address public highestBidder;
    uint256 public highestBid;
// blindedbids => bidders
    mapping(uint256 => address) public hashedBidsToBidders;

    uint256[][] public reveal_bids;


    constructor(address semaphoreAddress, address _verifierAddress) {
        semaphore = ISemaphore(semaphoreAddress);

        groupId = semaphore.createGroup();
	verifierContractAddress = _verifierAddress;
    }
 function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[10] memory input
    ) public view returns (bool) {
        return IVerifier(verifierContractAddress).verifyProof(a, b, c, input);
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
        uint256 blindedBid,
        uint256[8] calldata points
    ) external {
        ISemaphore.SemaphoreProof memory proof = ISemaphore.SemaphoreProof(
            merkleTreeDepth,
            merkleTreeRoot,
            nullifier,
            blindedBid,
            groupId,
            points
        );

        semaphore.validateProof(groupId, proof);
	hashedBidsToBidders[blindedBid] = msg.sender;
        bids.push(bytes32(blindedBid));
    }

    function reveal_phase(uint256 public_bid, uint256 secret) external {
	    reveal_bids.push([public_bid, secret]);

    }
 function getBids()
        external
        view
        returns (bytes32[] memory)
    {
        return bids;
    }

 function getRevealBids()
        external
        view
        returns (uint256[][] memory)
    {
        return reveal_bids;
    }
/**
     * Auctioneer will call this to getHighestBidder. restrict it to a certain address.
     * input: highestBidValue, highestBlindedBid, bidsWithValidityStatus[totalBids], blindedBids[totalBids]
     * cross-reference validity status with blindedBids using same position
     */
    function getHighestBidder(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[10] memory input
    ) external {
        uint8 bidsLength = uint8(bids.length);
        // check that bids correspond to blindedBids in input values
        for (uint8 i = 0; i < bidsLength;) {
            require(
                 bytes32(input[i + 2 + bidsLength]) == bids[i],
                "blindedBids inputs to proof do not match auction blinded bids"
            );
            unchecked {
                ++i;
            }
        }

        require(highestBidder == address(0), "bids were already tallied");
        // run verify proof
        require(verifyProof(a, b, c, input) == true, "proof is not valid");
        highestBid = input[0] * 1 ether; // convert to ether
        highestBidder = hashedBidsToBidders[(input[1])];

        // for all refundable deposits, refund the bidder
        // if there are 4 bids, there will be 4+2 inputs.  i < (10-4)
        // i is going through the validity status of all bids which would be from input[2] to input[2+ bids.length]
        // for (uint8 i = 2; i < input.length - bidsLength;) {
        //     address bidder = hashedBidsToBidders[
        //         bytes32(input[i + bidsLength])
        //     ];
        //     // refund valid bids that were not the winner and had valid deposits
        //     if (
        //         deposits[bidder] > 0 && bidder != highestBidder && input[i] == 1
        //     ) {
        //         uint256 toRefund = deposits[bidder];
        //         deposits[bidder] = 0;
        //         payable(bidder).transfer(toRefund);
        //     }
        //     unchecked {
        //         ++i;
        //     }
        // }
    }

 function ghighestBidder()
        external
        view
        returns (uint256)
    {
        return highestBid;
    }
}
