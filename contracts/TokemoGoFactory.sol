// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TokemoGo.sol";

contract TokemoGoFactory {
    // Array to store addresses of all deployed game contracts
    TokemoGo[] public deployedGames;

    // Event to notify external listeners when a new game is created
    event GameCreated(
        address gameAddress,
        address master,
        uint assetValue,
        uint endTime
    );

    // Function to create a new game
    function createGame(address _usdt, uint _assetValue, uint _endTime) public {
        // Ensure the passed time is in the future and any other necessary checks
        require(_endTime > block.timestamp, "End time must be in the future");

        // Create a new TokemoGo game contract
        TokemoGo newGame = new TokemoGo(
            msg.sender, // The creator becomes the game master
            _usdt, // USDT address for deposits
            _assetValue, // The asset value limit for the game
            _endTime // When the game ends
        );

        // Add the new game's address to the array
        deployedGames.push(newGame);

        // Trigger the event
        emit GameCreated(address(newGame), msg.sender, _assetValue, _endTime);
    }

    // Function to retrieve all deployed games
    function getDeployedGames() public view returns (TokemoGo[] memory) {
        return deployedGames;
    }
}
