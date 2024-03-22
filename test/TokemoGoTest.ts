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
import exp from "constants";
const hre = require("hardhat");

describe("TokemoGoFactory", function () {
  this.timeout(150000);
  let tokemoGoFactory: TokemoGoFactory;
  //let usdtMock: USDTMock;
  let challenger: Signer;
  let tokemoGo: TokemoGo;
  let maxeyAddress: string;
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
    // 获取账户
    [challenger] = await ethers.getSigners();
    maxeyAddress = "0xC13c8066b82c6785773A1e04e0442Dd4Ca8d552B";

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [maxeyAddress],
    });

    usdc = await ethers.getContractAt("ERC20", usdcAddress);
    impMaxey = await ethers.getSigner(maxeyAddress);
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
    // 部署TokemoGoFactory
    const TokemoGoFactory = await ethers.getContractFactory("TokemoGoFactory");
    tokemoGoFactory = await TokemoGoFactory.deploy();
  });

  it("master should have USDT after deployment", async function () {
    const balance = await usdc.balanceOf(maxeyAddress);
    expect(balance).to.equal(25000000000n);
  });

  it("should mint USDT to challenger", async function () {
    let maxeyBalance = await usdc.balanceOf(maxeyAddress);
    // Transfer USDC to challenger
    await usdc
      .connect(impMaxey)
      .transfer(challenger.getAddress(), maxeyBalance / 2n);
    const balance = await usdc.balanceOf(challenger.getAddress());
    expect(balance).to.equal(maxeyBalance / 2n);
  });

  it("should allow master creating a new game", async function () {
    const assetValue = ethers.parseUnits("100", 6);
    const now = Math.floor(Date.now() / 1000); // 获取当前时间的UNIX时间戳（秒）
    const endTime = now + 86400; // 1 day from now

    await expect(
      tokemoGoFactory
        .connect(impMaxey)
        .createGame(usdc.getAddress(), assetValue, endTime)
    )
      .to.emit(tokemoGoFactory, "GameCreated")
      .withArgs(ethers.isAddress, maxeyAddress, assetValue, endTime);

    const deployedGames = await tokemoGoFactory.getDeployedGames();
    expect(deployedGames.length).to.equal(1);
  });

  it("should allow master to create the game, and challenger to join the game", async function () {
    const masterBalanceBefore = await usdc.balanceOf(maxeyAddress);
    console.log(
      "--- Master USDC Balance Before Game ---:",
      masterBalanceBefore / 1000000n
    );

    const challengerBalanceBefore = await usdc.balanceOf(
      challenger.getAddress()
    );
    console.log(
      "--- Challenger USDC Balance Before Game ---:",
      challengerBalanceBefore / 1000000n
    );

    const totalUSDCBefore = masterBalanceBefore + challengerBalanceBefore;
    const assetValue = 10n * 1000000n;
    const now = Math.floor(Date.now() / 1000); // 获取当前时间的UNIX时间戳（秒）
    const endTime = now + 1800; // 0.5 day from now

    // 创建新游戏并获取游戏地址
    const createGameTx = await tokemoGoFactory
      .connect(impMaxey)
      .createGame(await usdc.getAddress(), assetValue, endTime);
    const receipt = await createGameTx.wait();
    const filter = tokemoGoFactory.filters.GameCreated();
    const events = await tokemoGoFactory.queryFilter(filter);
    const gameAddress = events[0].args.gameAddress;
    expect(gameAddress).to.not.be.undefined;

    // 使用获取的游戏地址与游戏合约交互
    tokemoGo = await ethers.getContractAt("TokemoGo", gameAddress);
    // 轉賬的金額，以ETH為單位
    const amount = ethers.parseEther("10");
    // 執行轉賬操作
    const tx = await challenger.sendTransaction({
      to: await tokemoGo.getAddress(),
      value: amount,
    });

    // 等待交易完成
    await tx.wait();

    console.log(
      "--- YD Token Balance of challenger ---:",
      await YDToken.balanceOf(await challenger.getAddress())
    );
    // Master YD Token Balance
    console.log(
      "--- YD Token Balance of Maxey ---:",
      await YDToken.balanceOf(maxeyAddress)
    );

    console.log(
      "--- YD Token Balance of tokemoGo ---:",
      await YDToken.balanceOf(await tokemoGo.getAddress())
    );
    console.log(
      "--- Maxey Token Balance of challenger ---:",
      await maxeyToken.balanceOf(await challenger.getAddress())
    );
    console.log(
      "--- Maxey Token Balance of Maxey ---:",
      await maxeyToken.balanceOf(maxeyAddress)
    );

    console.log(
      "--- Maxey Token Balance of tokemoGo ---:",
      await maxeyToken.balanceOf(await tokemoGo.getAddress())
    );
    const usdtAmount = 5n * 1000000n;
    // 准备TokenInfo数组
    const masterAssetArray = [
      {
        token: usdc.getAddress(),
        amount: usdtAmount,
      },
    ];

    // Master向游戏合约抵押USDT
    const depositAmount = 10n * 1000000n;
    await usdc.connect(impMaxey).approve(tokemoGo.getAddress(), MaxInt256);
    await expect(
      tokemoGo
        .connect(impMaxey)
        .depositUSDT(depositAmount, masterAssetArray, YDAddress)
    );

    // show the master's USDC balance
    const masterBal = await usdc.balanceOf(maxeyAddress);

    // 验证抵押后的游戏合约状态
    const gameMasterDetails = await tokemoGo.gameMasterDetails();
    expect(gameMasterDetails.valueInU).to.equal(depositAmount);

    // Challenger向游戏合约抵押USDT
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
    // get chanllenger usdc balance
    const challengerBal = await usdc.balanceOf(await challenger.getAddress());
    await expect(
      tokemoGo
        .connect(challenger)
        .depositUSDT(depositAmount, challengerAssetArray, maxeyCoinAddress)
    );

    // 检查游戏是否已经开始
    const gameStarted = await tokemoGo.gameStarted();
    expect(gameStarted).to.be.true;
    const masterValue: bigint = await tokemoGo.getGameMasterValue();
    const challengerValue: bigint = await tokemoGo.getChallengerValue();

    // 验证抵押后的游戏合约状态
    const challengerDetails = await tokemoGo.challengerDetails();
    expect(challengerDetails.valueInU).to.equal(depositAmount);

    await YDToken.connect(impMaxey).approve(tokemoGo.getAddress(), MaxInt256);
    await tokemoGo
      .connect(impMaxey)
      .betForGameMaster(await YDToken.balanceOf(maxeyAddress));

    // -------------------Challenger Bet-------------------

    await maxeyToken
      .connect(challenger)
      .approve(tokemoGo.getAddress(), MaxInt256);

    await tokemoGo
      .connect(challenger)
      .betForChallenger(await maxeyToken.balanceOf(challenger.getAddress()));

    // 快进时间以确保当前时间超过游戏的endTime
    await ethers.provider.send("evm_increaseTime", [86400 * 30]); // 快进一天加一秒
    await ethers.provider.send("evm_mine", []); // 挖掘新的区块以确认时间变化
    // 结束游戏
    await expect(tokemoGo.connect(impMaxey).endGame()).to.emit(
      tokemoGo,
      "GameEnded"
    );

    console.log("\nGame Ended Maxey WON!!!\n");

    const masterBalance = await usdc.balanceOf(maxeyAddress);
    console.log(
      "--- Master USDT Balance After Game Ended ---:",
      masterBalance / 1000000n
    );

    const challengerBalance = await usdc.balanceOf(challenger.getAddress());
    console.log(
      "--- Challenger USDT Balance After Game Ended ---:",
      challengerBalance / 1000000n
    );

    console.log(
      "--- YD Token Balance of challenger ---:",
      await YDToken.balanceOf(await challenger.getAddress())
    );
    // Master YD Token Balance
    console.log(
      "--- YD Token Balance of Maxey ---:",
      await YDToken.balanceOf(maxeyAddress)
    );

    console.log(
      "--- YD Token Balance of tokemoGo ---:",
      await YDToken.balanceOf(await tokemoGo.getAddress())
    );
    console.log(
      "--- Maxey Token Balance of challenger ---:",
      await maxeyToken.balanceOf(await challenger.getAddress())
    );
    console.log(
      "--- Maxey Token Balance of Maxey ---:",
      await maxeyToken.balanceOf(maxeyAddress)
    );

    console.log(
      "--- Maxey Token Balance of tokemoGo ---:",
      await maxeyToken.balanceOf(await tokemoGo.getAddress())
    );

    const totalUSDCAfter = masterBalance + challengerBalance;
    expect(totalUSDCAfter).to.equal(totalUSDCBefore);
  });
});
