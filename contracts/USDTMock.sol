// SPDX-License-Identifier: MIT
pragma solidity =0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDTMock is ERC20 {
    constructor() ERC20("USDT Mock", "USDTM") {
        _mint(msg.sender, 100); // Initially mint a certain amount of tokens to the deployer, e.g., 1 million
    }

    // Function to allow anyone to mint tokens to any address, useful for testing
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    // You can add more functions to meet test requirements, such as token issuance and destruction
}
