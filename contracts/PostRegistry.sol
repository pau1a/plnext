// Demo/live behaviour: Reference contract for live anchoring; deploy and wire before switching wallet mode to live.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PostRegistry {
    event PostAnchored(bytes32 indexed postHash, address indexed signer, uint256 ts);

    function anchor(bytes32 postHash) external {
        emit PostAnchored(postHash, msg.sender, block.timestamp);
    }
}
