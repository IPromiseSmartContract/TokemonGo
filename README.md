# TokemoGo For ETH Taipei 2024

## TokemonGo: A GameFi and SocialFi Integrated Challenge

**Introduction**
- **Game Setup:** The Master sets a game collateral threshold, such as 100 USDC, and the game's deadline.
- **Token Combination For Master:** Master create a token combination equal to the value of 100 USDC (for example, `0.01 ETH and 0.001 BTC = Total 100 USDC`).
- **Token Combination For Challenger** Challengers can stake 100 USDC to propose a better token combination. 
- **Who can Win?** The winner is the one with the higher value asset combination when the game time ends.

**Yield Generation:**

- If the game duration exceeds one day, staked assets are invested in `Dyson Finance` through dual investment strategies, generating yields for GameFi, SocialFi, and NFT DApps.

**SocialFi Integration:**

- **Fan Tokens:** `Mint Club` is used to create fan tokens for Masters and Challengers, allowing the community to purchase fan tokens of the players they support and bet on their game outcomes.
- **Mechnism For Fans Token:** The losing side's fan tokens are burned, enhancing the value of the winning side's fan tokens.

**Circle USDC Integration:**
- TokemonGo innovatively uses `Circle`'s USDC, merging the stability of traditional finance with the dynamic world of GameFi and SocialFi, to create a secure and efficient gaming economy.
## Architecture
![alt text](images/arch.png)

## Dyson Finance Integrations
**When the game period is bigger than 1 days, it will automatically deposit to Dyson to earn money.**
![alt text](./images/deposit.png)

**Deposit To Dyson Finance**
![alt text](./images/dyson.png)

**Withdraw from Dyson Finance**
![alt text](./images/withdraw.png)
## How To Run?

```bash
git clone https://github.com/IPromiseSmartContract/TokemonGo.git
cd TokemonGo
cp .env.example .env
# After copying the .env.example file to .env, you'll need to fill in the following fields in the .env file:
# SEP_URL = "" - The URL for your Sepolia Endpoint.
# SEPOLIA_PRIVATE_KEY="" - Your private key for the Sepolia network wallet.
# ETHER_SCAN_API_KEY="" - Your API key for Etherscan,.
yarn install
yarn test
```

**Important Testing Note:**

Due to the nature of forking test networks, running all tests simultaneously can lead to interference between them. To ensure accurate and reliable test results, it's recommended to run tests individually. This approach prevents potential conflicts and guarantees the integrity of the testing process. 

For a comprehensive test with a single command, you can use:
```
yarn test
```

Alternatively, to run specific tests independently and avoid any overlap, use the following commands:
```
hh test test/TokemonGoTest.ts
hh test test/AutoDepositDysonTest.ts
```

These steps ensure that each test is executed in isolation, providing clear and precise outcomes.

