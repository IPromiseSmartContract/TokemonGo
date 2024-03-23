import { ethers } from "hardhat";
import { expect } from "chai";
import { MaxInt256, Signer } from "ethers";
import {
  TokemoGoFactory,
  TokemoGo,
  MCV2_Bond,
  MCV2_Token,
  MCV2_ZapV1,
  ERC20,
} from "../typechain-types";
const hre = require("hardhat");

describe("TokemoGoFactory", function () {
  this.timeout(150000);
  let tokemoGoFactory: TokemoGoFactory;
  let challenger: Signer;
  let tokemoGo: TokemoGo;
  let maxeyWalletAddress: string;
  let impMaxey: Signer;
  let bond: MCV2_Bond;
  let YDToken: MCV2_Token;
  let maxeyToken: MCV2_Token;
  let zap: MCV2_ZapV1;
  let usdc: ERC20;
  const usdcAddress = "0xFA0bd2B4d6D629AdF683e4DCA310c562bCD98E4E";
  const bondAddress = "0x8dce343A86Aa950d539eeE0e166AFfd0Ef515C0c";
  const YDAddress = "0xdfe35d04C1270b2c94691023511009329e74E7f9";
  const zapAddress = "0x1Bf3183acc57571BecAea0E238d6C3A4d00633da";
  const maxeyCoinAddress = "0x14178B278CB9ec021d538Df3e6f16F476EfE0301";

  beforeEach(async function () {
    // Fork the seplolia network and use my account as the master
    maxeyWalletAddress = "0xC13c8066b82c6785773A1e04e0442Dd4Ca8d552B";
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [maxeyWalletAddress],
    });
    // We use local signer to join the game
    [challenger] = await ethers.getSigners();

    // Get the contract instances
    usdc = await ethers.getContractAt("ERC20", usdcAddress);
    impMaxey = await ethers.getSigner(maxeyWalletAddress);
    bond = await ethers.getContractAt("MCV2_Bond", bondAddress);
    YDToken = await ethers.getContractAt("MCV2_Token", YDAddress);
    maxeyToken = await ethers.getContractAt("MCV2_Token", maxeyCoinAddress);
    zap = await ethers.getContractAt("MCV2_ZapV1", zapAddress);

    // Mint maxeyCoin to challenger, so that he can use to bet
    await zap
      .connect(challenger)
      .mintWithEth(maxeyCoinAddress, 2000n, await challenger.getAddress(), {
        value: ethers.parseEther("0.1"),
      });

    const TokemoGoFactory = await ethers.getContractFactory("TokemoGoFactory");
    tokemoGoFactory = await TokemoGoFactory.deploy();
  });

  it("master should have USDC after deployment", async function () {
    const balance = await usdc.balanceOf(maxeyWalletAddress);
    expect(balance).to.equal(25000000000n);
  });

  it("should mint USDC to challenger", async function () {
    let maxeyBalance = await usdc.balanceOf(maxeyWalletAddress);
    // Transfer USDC to challenger
    await usdc
      .connect(impMaxey)
      .transfer(challenger.getAddress(), maxeyBalance / 2n);
    const balance = await usdc.balanceOf(challenger.getAddress());
    expect(balance).to.equal(maxeyBalance / 2n);
  });

  it("should allow master creating a new game", async function () {
    const assetValue = ethers.parseUnits("100", 6);
    const now = Math.floor(Date.now() / 1000); // Get the UNIX timestamp of the current time in seconds
    const endTime = now + 86400; // 1 day from now

    await expect(
      tokemoGoFactory
        .connect(impMaxey)
        .createGame(usdc.getAddress(), assetValue, endTime)
    )
      .to.emit(tokemoGoFactory, "GameCreated")
      .withArgs(ethers.isAddress, maxeyWalletAddress, assetValue, endTime);

    const deployedGames = await tokemoGoFactory.getDeployedGames();
    expect(deployedGames.length).to.equal(1);
  });

  it("Should not create a new game if block.timestamp is greater than endTime", async function () {
    const assetValue = ethers.parseUnits("100", 6);
    const now = Math.floor(Date.now() / 1000);
    const endTime = now - 86400 * 100; // Make the end time in the past

    await expect(
      tokemoGoFactory
        .connect(impMaxey)
        .createGame(usdc.getAddress(), assetValue, endTime)
    ).to.be.revertedWith("End time must be in the future");
  });

  it("Should allow master to create the game, and challenger to join the game (Without deposit in Dyson)", async function () {
    const masterBalanceBefore = await usdc.balanceOf(maxeyWalletAddress);
    const challengerBalanceBefore = await usdc.balanceOf(
      await challenger.getAddress()
    );
    console.log("[Before Game Start]\n");
    console.log(
      `Master USDC Balance Before Game: ${masterBalanceBefore / 1000000n} USDC`
    );
    console.log(
      `Challenger USDC Balance Before Game: ${
        challengerBalanceBefore / 1000000n
      } USDC`
    );

    const totalUSDCBefore = masterBalanceBefore + challengerBalanceBefore;
    const assetValue = 10n * 1000000n;
    const now = Math.floor(Date.now() / 1000);
    const endTime = now + 1800; // 30 minutes from now

    // Create a new game
    const createGameTx = await tokemoGoFactory
      .connect(impMaxey)
      .createGame(await usdc.getAddress(), assetValue, endTime);
    const receipt = await createGameTx.wait();
    const filter = tokemoGoFactory.filters.GameCreated();
    const events = await tokemoGoFactory.queryFilter(filter);
    const gameAddress = events[0].args.gameAddress;
    expect(gameAddress).to.not.be.undefined;

    // Get the game instance
    tokemoGo = await ethers.getContractAt("TokemoGo", gameAddress);

    // Challenger's YD balance should be 0
    expect(await YDToken.balanceOf(await challenger.getAddress())).to.equal(0);

    // Master YD Token Balance should be larger than 0, so that he can bet
    expect(await YDToken.balanceOf(maxeyWalletAddress)).to.be.gt(0);
    // Master YD Token Balance

    console.log(
      `YD Token Balance of Maxey: ${await YDToken.balanceOf(
        maxeyWalletAddress
      )} YD Tokens`
    );

    // TokemonGo's YD Token Balance should be 0 before the game starts
    expect(await YDToken.balanceOf(await tokemoGo.getAddress())).to.equal(0);

    // Challenger's Maxey Token Balance should be larger than 0, so that he can bet
    const maxeyTokenBalanceBefore = await maxeyToken.balanceOf(
      await challenger.getAddress()
    );

    console.log(
      `Maxey Token Balance of Challenger: ${maxeyTokenBalanceBefore} Maxey Tokens`
    );
    expect(await maxeyToken.balanceOf(await challenger.getAddress())).to.be.gt(
      0
    );

    console.log("\n[End of Before Game Start Information]");

    // Maxey's Maxey Token Balance should be 0
    expect(await maxeyToken.balanceOf(maxeyWalletAddress)).to.equal(0);

    // TokemoGo's Maxey Token Balance should be 0 before the game starts
    expect(await maxeyToken.balanceOf(await tokemoGo.getAddress())).to.equal(0);

    const usdCAmount = 5n * 1000000n;
    // Prepare TokenInfo array and it only uses USDC
    const masterAssetArray = [
      {
        token: usdc.getAddress(),
        amount: usdCAmount,
      },
    ];

    // Master Deposit USDC to the game contract
    const depositAmount = 10n * 1000000n;
    await usdc.connect(impMaxey).approve(tokemoGo.getAddress(), MaxInt256);
    await expect(
      tokemoGo
        .connect(impMaxey)
        .depositUSDC(depositAmount, masterAssetArray, YDAddress)
    );

    // show the master's USDC balance
    const masterBal = await usdc.balanceOf(maxeyWalletAddress);

    // Check master deposit is successful
    const gameMasterDetails = await tokemoGo.gameMasterDetails();
    expect(gameMasterDetails.valueInU).to.equal(depositAmount);

    // Challenger Deposit USDC to the game contract
    const wethAddress = "0xf531B8F309Be94191af87605CfBf600D71C2cFe0";
    const wethAmount = ethers.parseEther("1") / 1000n;
    const wethPrice = 2;
    const challengerAssetArray = [
      {
        token: wethAddress, // WETH
        amount: wethAmount,
      },
    ];
    await usdc.connect(challenger).approve(tokemoGo.getAddress(), MaxInt256);
    // Get chanllenger usdc balance
    const challengerBal = await usdc.balanceOf(await challenger.getAddress());
    await expect(
      tokemoGo
        .connect(challenger)
        .depositUSDC(depositAmount, challengerAssetArray, maxeyCoinAddress)
    );

    // Check if the game has started
    const gameStarted = await tokemoGo.gameStarted();
    expect(gameStarted).to.be.true;

    // Check challenger deposit is successful
    const challengerDetails = await tokemoGo.challengerDetails();
    expect(challengerDetails.valueInU).to.equal(depositAmount);

    await YDToken.connect(impMaxey).approve(tokemoGo.getAddress(), MaxInt256);
    await tokemoGo
      .connect(impMaxey)
      .betForGameMaster(await YDToken.balanceOf(maxeyWalletAddress));

    // -------------------Challenger Bet-------------------

    await maxeyToken
      .connect(challenger)
      .approve(tokemoGo.getAddress(), MaxInt256);

    await tokemoGo
      .connect(challenger)
      .betForChallenger(await maxeyToken.balanceOf(challenger.getAddress()));

    // Fast forward time to the end of the game
    await ethers.provider.send("evm_increaseTime", [86400 * 30]);
    await ethers.provider.send("evm_mine", []);
    // End the game
    await expect(tokemoGo.connect(impMaxey).endGame()).to.emit(
      tokemoGo,
      "GameEnded"
    );

    console.log("\n--- Game Ended Challenger WON ---\n");

    console.log("[After Game Ended]\n");

    const masterBalance = await usdc.balanceOf(maxeyWalletAddress);
    console.log(
      `Master USDC Balance After Game Ended: ${masterBalance / 1000000n} USDC`
    );
    const challengerBalance = await usdc.balanceOf(
      await challenger.getAddress()
    );
    console.log(
      `Challenger USDC Balance After Game Ended: ${
        challengerBalance / 1000000n
      } USDC`
    );

    // Maxey's YD Token Balance should be 0, cuz he lost the game
    expect(await YDToken.balanceOf(maxeyWalletAddress)).to.equal(0);

    // TokemoGo's YD Token Balance should be 0 after the game ends
    expect(await YDToken.balanceOf(await tokemoGo.getAddress())).to.equal(0);

    // TokemoGo's Maxey Token Balance should be 0 after the game ends
    expect(await maxeyToken.balanceOf(await tokemoGo.getAddress())).to.equal(0);

    // Challenger's Maxey Token Balance should be larger than before, cuz he won the game
    const maxeyTokenBalanceAfter = await maxeyToken.balanceOf(
      await challenger.getAddress()
    );
    expect(maxeyTokenBalanceAfter).to.be.gt(maxeyTokenBalanceBefore);
    console.log(
      `YD Token Balance of Maxey: ${await YDToken.balanceOf(
        maxeyWalletAddress
      )} YD Tokens (Expected to be 0, because he lost the game)`
    );
    console.log(
      `Maxey Token Balance of Challenger After Winning: ${await maxeyToken.balanceOf(
        await challenger.getAddress()
      )} Maxey Tokens (Should be greater than before)`
    );
    console.log("\n[End of After Game Ended Information]\n");
    // Maxey's Maxey Token Balance should be 0, cuz he lost the game
    expect(await maxeyToken.balanceOf(maxeyWalletAddress)).to.equal(0);

    // TokemoGo's Maxey Token Balance should be 0 after the game ends
    expect(await maxeyToken.balanceOf(await tokemoGo.getAddress())).to.equal(0);

    // Total USDC should be the same before and after the game
    const totalUSDCAfter = masterBalance + challengerBalance;
    expect(totalUSDCAfter).to.equal(totalUSDCBefore);
  });
});
