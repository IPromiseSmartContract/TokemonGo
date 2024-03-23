// SPDX-License-Identifier: MIT
pragma solidity =0.8.20;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MCV2_ZapV1} from "./MCV/MCV2_ZapV1.sol";
import {MCV2_Token} from "./MCV/MCV2_Token.sol";
import {MCV2_Bond} from "./MCV/MCV2_Bond.sol";
import "hardhat/console.sol";

interface IPair {
    function deposit0(
        address to,
        uint input,
        uint minOutput,
        uint time
    ) external returns (uint output);

    function deposit1(
        address to,
        uint input,
        uint minOutput,
        uint time
    ) external returns (uint output);

    function withdraw(
        uint index,
        address to
    ) external returns (uint token0Amt, uint token1Amt);

    function withdrawFrom(
        address from,
        uint index,
        address to
    ) external returns (uint token0Amts, uint token1Amts);

    function setApprovalForAll(address operator, bool approved) external;
}

interface Idyson {
    function claimToken() external;
}

interface IERC20Extended is IERC20 {
    function decimals() external view returns (uint8);
}

contract TokemoGo {
    address public gameMaster;
    uint public assetValue;
    uint public endTime;
    bool public gameStarted = false;
    bool public gameEnded = false;
    address public masterFansToken;
    address public challengerFansToken;
    address public masterFans;
    address public challengerFans;
    uint public masterFansTokenAmount = 0;
    uint public challengerFansTokenAmount = 0;
    MCV2_Bond mcv2_bond;
    MCV2_ZapV1 private zapV1;
    address public zapV1Address = 0x1Bf3183acc57571BecAea0E238d6C3A4d00633da;
    AggregatorV3Interface internal priceFeed =
        AggregatorV3Interface(0x9326BFA02ADD2366b30bacB125260Af641031331);

    // Dyson Finance
    // The DYSON-USDC pair contract on Polygon zkEVM.
    // In this pair, the token0 represents $DYSN and token1 represents $USDC.
    address dysonUsdcPair = 0xd0f3c7d3d02909014303d13223302eFB80A29Ff3;
    // The $DYSN contract on Polygon zkEVM.
    // The $USDC contract on Polygon zkEVM.
    address public USDC;
    address to = address(this);
    uint lockTime = 1 days; // Deposit for 1 day
    uint minOutput = 0;

    // assume that 1 $DYSN = 1 $USDC
    uint dysonIn = 100e18; // 100 $DYSN
    uint minUSDCOut = 10e6; // Slippage = 10%

    uint usdcIn = 1e6; // 1 $USDC
    uint minDysonOut = 10e18; // Slippage = 10%

    uint public dysonOrNot = 0;
    uint public dysonDepositOutput = 0;

    mapping(address => address) public tokenToFeed;

    struct TokenInfo {
        address token;
        uint amount;
    }

    struct Player {
        address playerAddress;
        uint valueInU; // Value in USDC
        bool hasJoined;
        address fansToken;
        TokenInfo[] tokenInfo; // Player's token portfolio
    }

    Player public gameMasterDetails;
    Player public challengerDetails;

    event DepositUSDC(address indexed player, uint amount, uint valueInU);
    event GameEnded(address winner, uint winnerValueInU, uint loserValueInU);

    constructor(
        address _gameMaster,
        address _USDC,
        uint _assetValue,
        uint _endTime
    ) {
        gameMaster = _gameMaster;
        USDC = _USDC;
        assetValue = _assetValue;
        endTime = _endTime;
        zapV1 = MCV2_ZapV1(payable(zapV1Address)); // sepolia
        mcv2_bond = MCV2_Bond(0x8dce343A86Aa950d539eeE0e166AFfd0Ef515C0c);
        Idyson(address(0x889a28163f08CdCF079C0692b23E4C586e811889)).claimToken();
        // USDC
        tokenToFeed[
            0xFA0bd2B4d6D629AdF683e4DCA310c562bCD98E4E
        ] = 0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E;

        // WETH
        tokenToFeed[
            0xf531B8F309Be94191af87605CfBf600D71C2cFe0
        ] = 0x694AA1769357215DE4FAC081bf1f309aDC325306;

        // AUD
        tokenToFeed[
            0xB0C712f98daE15264c8E26132BCC91C40aD4d5F9
        ] = 0xB0C712f98daE15264c8E26132BCC91C40aD4d5F9;

        // BTC / USD
        tokenToFeed[
            0x5fb1616F78dA7aFC9FF79e0371741a747D2a7F22
        ] = 0x5fb1616F78dA7aFC9FF79e0371741a747D2a7F22;

        // CSPX / USD
        tokenToFeed[
            0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43
        ] = 0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43;

        // CZK / USD
        tokenToFeed[
            0x4b531A318B0e44B549F3b2f824721b3D0d51930A
        ] = 0x4b531A318B0e44B549F3b2f824721b3D0d51930A;

        // DAI / USD
        tokenToFeed[
            0xC32f0A9D70A34B9E7377C10FDAd88512596f61EA
        ] = 0xC32f0A9D70A34B9E7377C10FDAd88512596f61EA;

        // ETH / USD
        tokenToFeed[
            0x14866185B1962B63C3Ea9E03Bc1da838bab34C19
        ] = 0x14866185B1962B63C3Ea9E03Bc1da838bab34C19;

        // EUR / USD
        tokenToFeed[
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        ] = 0x694AA1769357215DE4FAC081bf1f309aDC325306;

        // FORTH / USD
        tokenToFeed[
            0x1a81afB8146aeFfCFc5E50e8479e826E7D55b910
        ] = 0x1a81afB8146aeFfCFc5E50e8479e826E7D55b910;

        // GBP / USD
        tokenToFeed[
            0x070bF128E88A4520b3EfA65AB1e4Eb6F0F9E6632
        ] = 0x070bF128E88A4520b3EfA65AB1e4Eb6F0F9E6632;

        // GHO / USD
        tokenToFeed[
            0x91FAB41F5f3bE955963a986366edAcff1aaeaa83
        ] = 0x91FAB41F5f3bE955963a986366edAcff1aaeaa83;

        // IB01 / USD
        tokenToFeed[
            0x635A86F9fdD16Ff09A0701C305D3a845F1758b8E
        ] = 0x635A86F9fdD16Ff09A0701C305D3a845F1758b8E;

        // IBTA / USD
        tokenToFeed[
            0xB677bfBc9B09a3469695f40477d05bc9BcB15F50
        ] = 0xB677bfBc9B09a3469695f40477d05bc9BcB15F50;

        // JPY / USD
        tokenToFeed[
            0x5c13b249846540F81c093Bc342b5d963a7518145
        ] = 0x5c13b249846540F81c093Bc342b5d963a7518145;

        // LINK / USD
        tokenToFeed[
            0x42585eD362B3f1BCa95c640FdFf35Ef899212734
        ] = 0x42585eD362B3f1BCa95c640FdFf35Ef899212734;

        // SNX / USD
        tokenToFeed[
            0xc59E3633BAAC79493d908e63626716e204A45EdF
        ] = 0xc59E3633BAAC79493d908e63626716e204A45EdF;
    }

    // It will deposit the USDC to the Dyson Finance when the game period is more than 1 day
    function depositToDyson() internal returns (uint) {
        uint256 maxUint256 = type(uint256).max;
        IERC20(address(USDC)).approve(dysonUsdcPair, maxUint256);
        dysonDepositOutput = IPair(address(dysonUsdcPair)).deposit1(
            to,
            2 * assetValue,
            minOutput,
            lockTime
        );
        return dysonDepositOutput;
    }

    function withdraw(
        uint index,
        address to
    ) internal returns (uint token0Amt, uint token1Amt) {
        return IPair(dysonUsdcPair).withdraw(index, to);
    }

    // General function for depositing USDC
    function depositUSDC(
        uint amount,
        TokenInfo[] memory tokens,
        address fansToken
    ) public {
        require(
            block.timestamp < endTime,
            "Cannot deposit after the game has ended"
        );
        require(!gameEnded, "Game has ended");
        require(amount > 0, "Deposit amount must be greater than 0");
        require(
            amount <= assetValue,
            "Deposit amount exceeds asset value limit"
        );

        // Transfer USDC from the sender to the contract
        require(
            IERC20(USDC).transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );

        Player storage player;
        if (msg.sender != gameMaster) {
            player = challengerDetails;
        } else {
            player = gameMasterDetails;
        }
        require(!player.hasJoined, "Player has already joined");
        player.playerAddress = msg.sender;
        player.hasJoined = true;
        player.valueInU = amount;
        player.fansToken = fansToken;

        uint totalValueInU = 0;
        for (uint i = 0; i < tokens.length; i++) {
            // Retrieve the latest price of the token
            int256 tokenprice = getLatestPrice(tokenToFeed[tokens[i].token]);
            uint256 tmp;
            if (tokenprice > 0) {
                tmp = uint256(tokenprice);
            }
            // Determine the precision required based on the Chainlink feed's decimal places
            uint256 precision = 10 **
                chainlinkDecimal(tokenToFeed[tokens[i].token]);
            tmp = tmp / precision;

            // Get the number of decimals for the token
            uint tokenDecimals = IERC20Extended(tokens[i].token).decimals();
            // Calculate the total value of the current token (using its own decimal places)
            uint256 tokenTotalValue = (tmp * tokens[i].amount) /
                10 ** tokenDecimals;

            // Convert the token's total value to be represented in USDC decimal places
            totalValueInU +=
                tokenTotalValue *
                10 ** IERC20Extended(USDC).decimals();

            // Record token information
            player.tokenInfo.push(TokenInfo(tokens[i].token, tokens[i].amount));
        }

        require(
            totalValueInU <= amount,
            "Declared token value exceeds the deposited USDC amount"
        );
        //player.valueInU = totalValueInU;

        emit DepositUSDC(msg.sender, amount, totalValueInU);

        if (!gameStarted) {
            gameStarted = true;
        }
        if (msg.sender != gameMaster && endTime > block.timestamp + 1 days) {
            dysonOrNot = 1;
            depositToDyson();
        }
    }

    // Logic to end the game, comparing the total asset value of players
    function endGame() public {
        require(block.timestamp >= endTime, "Game cannot end before endTime");
        require(!gameEnded, "Game has already ended");
        gameEnded = true; // Mark the game as ended
        if (dysonOrNot == 1) {
            (uint token0Amt, uint token1Amt) = withdraw(0, address(this));
            dysonOrNot = 0;
        }

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
                IERC20(USDC).transfer(player.playerAddress, player.valueInU),
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
        // Ensure payout does not exceed the loser's deposited USDC
        uint payout = (profit > loserDetails.valueInU)
            ? loserDetails.valueInU
            : profit;
        // Refund the remaining USDC to both the winner and the loser
        if (winnerDetails.valueInU >= payout) {
            require(
                IERC20(USDC).transfer(
                    winnerDetails.playerAddress,
                    winnerDetails.valueInU + payout
                ),
                "Refund to winner failed"
            );
        }
        if (loserDetails.valueInU >= payout) {
            require(
                IERC20(USDC).transfer(
                    loserDetails.playerAddress,
                    loserDetails.valueInU - payout
                ),
                "Refund to loser failed"
            );
        }
        uint refundETH = address(this).balance;

        // Burn the loser's fans token and convert it to ETH
        uint loserFansTokenAmount = loserDetails.playerAddress ==
            gameMasterDetails.playerAddress
            ? masterFansTokenAmount
            : challengerFansTokenAmount;
        MCV2_Token(loserDetails.fansToken).approve(
            zapV1Address,
            loserFansTokenAmount
        );
        (MCV2_ZapV1(payable(zapV1Address))).burnToEth(
            loserDetails.fansToken,
            loserFansTokenAmount,
            0,
            address(this)
        );
        // Calculate the amount of ETH to mint for the winner
        refundETH = address(this).balance - refundETH;
        uint128 priceToMint = mcv2_bond.priceForNextMint(
            winnerDetails.fansToken
        );
        uint decimals = MCV2_Token(winnerDetails.fansToken).decimals();
        uint amountToMint = (refundETH * 10 ** decimals) / priceToMint;
        // Mint the winner's fans token with the ETH from the loser's fans token
        (MCV2_ZapV1(payable(zapV1Address))).mintWithEth{value: refundETH}(
            winnerDetails.fansToken,
            (amountToMint * 99) / 100,
            winnerDetails.playerAddress
        );
        if (winnerDetails.playerAddress == gameMaster) {
            MCV2_Token(winnerDetails.fansToken).transfer(
                masterFans,
                masterFansTokenAmount
            );
        } else {
            MCV2_Token(winnerDetails.fansToken).transfer(
                challengerFans,
                challengerFansTokenAmount
            );
        }

        // Reset player asset information for both players
        resetPlayer(winnerDetails);
        resetPlayer(loserDetails);

        emit GameEnded(winnerDetails.playerAddress, winnerValue, loserValue);
    }

    // Burn the fans token and convert it to ETH
    function burnFansTokensToEth(
        address token,
        uint amount
    ) private returns (uint ethReceived) {
        (MCV2_ZapV1(payable(zapV1Address))).burnToEth(
            token,
            amount,
            0,
            address(0x1Bf3183acc57571BecAea0E238d6C3A4d00633da)
        );
        return 0;
    }

    // Calculate the player's total asset value based on their portfolio
    function getPlayerPortfolioValue(
        Player storage player
    ) internal view returns (uint totalValueInU) {
        for (uint i = 0; i < player.tokenInfo.length; i++) {
            uint price;
            if (
                player.tokenInfo[i].token ==
                address(0x694AA1769357215DE4FAC081bf1f309aDC325306)
            ) {
                price = 352395580588;
            } else {
                price = 100009481; // Use priceOracle.getPrice(tokens[i].token); to get the actual price
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

    function getLatestPrice(
        address priceFeedAddress
    ) public view returns (int) {
        AggregatorV3Interface priceFeedInstance = AggregatorV3Interface(
            priceFeedAddress
        );
        (
            ,
            /* uint80 roundID */ int price /* uint startedAt */ /* uint timeStamp */ /* uint80 answeredInRound */,
            ,
            ,

        ) = priceFeedInstance.latestRoundData();
        return price;
    }

    function chainlinkDecimal(
        address priceFeedAddress
    ) public view returns (uint8) {
        AggregatorV3Interface priceFeedInstance = AggregatorV3Interface(
            priceFeedAddress
        );
        return priceFeedInstance.decimals();
    }

    function betForChallenger(uint amount) public {
        challengerFans = msg.sender;
        MCV2_Token(challengerDetails.fansToken).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        challengerFansTokenAmount += amount;
    }

    function betForGameMaster(uint amount) public {
        masterFans = msg.sender;
        MCV2_Token(gameMasterDetails.fansToken).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        masterFansTokenAmount += amount;
    }

    function getDysonOutput() public view returns (uint) {
        return dysonDepositOutput;
    }

    receive() external payable {}
}
