// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external returns (bool);

    function transfer(address recipient, uint amount) external returns (bool);
}

interface IPriceOracle {
    // Get the price of a token relative to USDT
    function getPrice(address token) external view returns (uint);
}

contract TokemoGo {
    address public gameMaster;
    address public USDT;
    uint public assetValue;
    uint public endTime;
    bool public gameStarted = false;
    bool public gameEnded = false;
    IPriceOracle public priceOracle;
    AggregatorV3Interface internal priceFeed =
        AggregatorV3Interface(0x9326BFA02ADD2366b30bacB125260Af641031331);

    struct TokenInfo {
        address token;
        uint amount;
    }

    struct Player {
        address playerAddress;
        uint valueInU; // Value in USDT
        bool hasJoined;
        TokenInfo[] tokenInfo; // Player's token portfolio
    }

    Player public gameMasterDetails;
    Player public challengerDetails;

    event DepositUSDT(address indexed player, uint amount, uint valueInU);
    event GameEnded(address winner, uint winnerValueInU, uint loserValueInU);

    constructor(
        address _gameMaster,
        address _USDT,
        uint _assetValue,
        uint _endTime
    ) {
        gameMaster = _gameMaster;
        USDT = _USDT;
        assetValue = _assetValue;
        endTime = _endTime;
        // Initialize priceOracle here if necessary
    }

    // General function for depositing USDT
    function depositUSDT(uint amount, TokenInfo[] memory tokens) public {
        require(
            block.timestamp < endTime,
            "Cannot deposit after the game has ended"
        );
        require(!gameEnded, "Game has ended");
        require(amount > 0, "Deposit amount must be greater than 0");
        require(
            amount == assetValue,
            "Deposit amount exceeds asset value limit"
        );

        // Transfer USDT from the sender to the contract
        require(
            IERC20(USDT).transferFrom(msg.sender, address(this), amount),
            "USDT transfer failed"
        );

        Player storage player = msg.sender == gameMaster
            ? gameMasterDetails
            : challengerDetails;
        require(!player.hasJoined, "Player has already joined");
        player.playerAddress = msg.sender;
        player.hasJoined = true;
        player.valueInU = amount;
        //console.log("player.valueInU", player.valueInU);

        uint totalValueInU = 0;
        for (uint i = 0; i < tokens.length; i++) {
            uint price;
            if (
                tokens[i].token ==
                address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)
            ) {
                price = 2;
            } else {
                price = 1; // Use priceOracle.getPrice(tokens[i].token); to get the actual price
            }
            totalValueInU += price * tokens[i].amount;
            player.tokenInfo.push(TokenInfo(tokens[i].token, tokens[i].amount));
        }
        //console.log("player.valueInU", player.valueInU);
        require(
            totalValueInU <= amount,
            "Declared token value exceeds the deposited USDT amount"
        );
        //player.valueInU = totalValueInU;

        emit DepositUSDT(msg.sender, amount, totalValueInU);

        if (!gameStarted) {
            gameStarted = true;
        }
    }

    // Logic to end the game, comparing the total asset value of players
    function endGame() public {
        require(block.timestamp >= endTime, "Game cannot end before endTime");
        require(!gameEnded, "Game has already ended");
        gameEnded = true; // Mark the game as ended

        // Calculate the total asset value for each player
        uint gameMasterValue = getPlayerPortfolioValue(gameMasterDetails);
        uint challengerValue = getPlayerPortfolioValue(challengerDetails);

        if (gameMasterValue > challengerValue) {
            processWinning(
                gameMasterDetails,
                challengerDetails,
                gameMasterValue,
                challengerValue
            );
        } else if (gameMasterValue < challengerValue) {
            processWinning(
                challengerDetails,
                gameMasterDetails,
                challengerValue,
                gameMasterValue
            );
        } else {
            // Handle the tie case
            refund(gameMasterDetails);
            refund(challengerDetails);
            resetPlayer(gameMasterDetails);
            resetPlayer(challengerDetails);
            emit GameEnded(address(0), gameMasterValue, challengerValue); // Notify about the tie
        }
    }

    // Refund to a specific player
    function refund(Player storage player) private {
        if (player.valueInU > 0) {
            require(
                IERC20(USDT).transfer(player.playerAddress, player.valueInU),
                "Refund failed"
            );
        }
    }

    // Reset player's asset information
    function resetPlayer(Player storage player) private {
        player.valueInU = 0;
        player.hasJoined = false;
        delete player.tokenInfo; // Clears the token portfolio
    }

    // Process winner logic, including reward distribution
    function processWinning(
        Player storage winnerDetails,
        Player storage loserDetails,
        uint winnerValue,
        uint loserValue
    ) private {
        uint profit = winnerValue - loserValue; // Winner's profit
        // Ensure payout does not exceed the loser's deposited USDT
        uint payout = (profit > loserDetails.valueInU)
            ? loserDetails.valueInU
            : profit;

        // Transfer the payout to the winner
        // require(
        //     IERC20(USDT).transfer(winnerDetails.playerAddress, payout),
        //     "Payout to winner failed"
        // );

        // Refund the remaining USDT to both the winner and the loser
        if (winnerDetails.valueInU > payout) {
            require(
                IERC20(USDT).transfer(
                    winnerDetails.playerAddress,
                    winnerDetails.valueInU + payout
                ),
                "Refund to winner failed"
            );
        }
        if (loserDetails.valueInU > payout) {
            require(
                IERC20(USDT).transfer(
                    loserDetails.playerAddress,
                    loserDetails.valueInU - payout
                ),
                "Refund to loser failed"
            );
        }

        // Reset player asset information for both players
        resetPlayer(winnerDetails);
        resetPlayer(loserDetails);

        emit GameEnded(winnerDetails.playerAddress, winnerValue, loserValue);
    }

    // Calculate the player's total asset value based on their portfolio
    function getPlayerPortfolioValue(
        Player storage player
    ) internal view returns (uint totalValueInU) {
        //totalValueInU = player.valueInU; // Start with the direct USDT value
        for (uint i = 0; i < player.tokenInfo.length; i++) {
            //uint price = 1;//priceOracle.getPrice(player.tokenInfo[i].token); // Fetch current token price
            uint price;
            if (
                player.tokenInfo[i].token ==
                address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)
            ) {
                price = 2;
            } else {
                price = 1; // Use priceOracle.getPrice(tokens[i].token); to get the actual price
            }
            totalValueInU += price * player.tokenInfo[i].amount; // Calculate total portfolio value
        }
    }

    // Get the total asset value of the game master
    function getGameMasterValue() public view returns (uint) {
        return getPlayerPortfolioValue(gameMasterDetails);
    }

    // Get the total asset value of the challenger
    function getChallengerValue() public view returns (uint) {
        return getPlayerPortfolioValue(challengerDetails);
    }

    function getLatestPrice() public view returns (int) {
        (
            uint80 roundID,
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }
}
