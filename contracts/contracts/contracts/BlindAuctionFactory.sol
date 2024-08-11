// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import "./BlindAuction.sol";

contract BlindAuctionFactory {
    // blind auction contract
    address public implementation;
    address public verifierContract;
    address[] public blindAuctionProxies;
    uint256 groupId;
    using Clones for address;
    ISemaphore public semaphore;

    constructor(address _implementation, address _verifier, address semaphoreAddress) {
        semaphore = ISemaphore(semaphoreAddress);
        implementation = _implementation;
        verifierContract = _verifier;
    }

    function createBlindAuctionProxy(
	    uint256 maxBid
    ) external payable returns (address blindAuctionProxyContract) {
        
        blindAuctionProxyContract = Clones.clone(implementation);
        BlindAuction(blindAuctionProxyContract).initialize(
	    address(semaphore),
            verifierContract,
	    maxBid
        );
        //address blindAuction = address(blindAuctionProxyContract);
        //groupId = semaphore.createGroup(blindAuction);
        blindAuctionProxies.push(blindAuctionProxyContract);
        emit BlindAuctionCloneCreated(
            blindAuctionProxyContract,
            blindAuctionProxies.length,
            blindAuctionProxies
        );
        //return blindAuction;
    }
    function createGroup() public {
        groupId = semaphore.createGroup();
    }

    function getAllAuctions() public view returns (address[] memory) {
        return blindAuctionProxies;
    }

    function getAuctionById(uint8 id) public view returns (address) {
        return blindAuctionProxies[id];
    }

    event BlindAuctionCloneCreated(
        address blindAuctionContract,
        uint256 numAuctions,
        address[] blindAuctionProxies
    );
}
