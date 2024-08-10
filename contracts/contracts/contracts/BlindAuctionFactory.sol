// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./BlindAuction.sol";

contract BlindAuctionFactory {
    // blind auction contract
    address public implementation;
    address public verifierContract;
    address[] public blindAuctionProxies;
    using Clones for address;

    constructor(address _implementation, address _verifier) {
        implementation = _implementation;
        verifierContract = _verifier;
    }

    function createBlindAuctionProxy(
	    address semaphoreAddress
    ) external payable returns (address blindAuctionProxyContract) {
        blindAuctionProxyContract = Clones.clone(implementation);
        BlindAuction(blindAuctionProxyContract).initialize(
	    semaphoreAddress,
            verifierContract
        );
        blindAuctionProxies.push(blindAuctionProxyContract);
        emit BlindAuctionCloneCreated(
            blindAuctionProxyContract,
            blindAuctionProxies.length,
            blindAuctionProxies
        );
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
