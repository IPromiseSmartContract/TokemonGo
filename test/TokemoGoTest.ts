import { ethers } from "hardhat";
import { expect } from "chai";
import { MaxInt256, Signer, ZeroAddress } from "ethers";
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
    // console.log("@@@@@", await bond.getDetail(YDAddress));
    //console.log("Maxey Balance of YD:", await YDToken.balanceOf(maxeyAddress));
    // 部署USDT模拟合约
    // const USDTMock = await ethers.getContractFactory("USDTMock");
    // usdtMock = await USDTMock.connect(impMaxey).deploy();

    // 部署TokemoGoFactory
    const TokemoGoFactory = await ethers.getContractFactory("TokemoGoFactory");
    tokemoGoFactory = await TokemoGoFactory.deploy();
    // await tokemoGoFactory.deployed();

    // const mintAmount = 100n;
    // await usdtMock
    //   .connect(challenger)
    //   .mint(challenger.getAddress(), mintAmount);
  });

  it("master should have USDT after deployment", async function () {
    const balance = await usdc.balanceOf(maxeyAddress);
    console.log("Balance of Master", balance.toString());
    //expect(balance).to.equal(100n);
  });

  it("should mint USDT to challenger", async function () {
    let maxeyBalance = await usdc.balanceOf(maxeyAddress);
    // Transfer USDC to challenger
    await usdc
      .connect(impMaxey)
      .transfer(challenger.getAddress(), maxeyBalance / 2n);
    const balance = await usdc.balanceOf(challenger.getAddress());
    //console.log("Balance of Challenger", balance.toString());
    expect(balance).to.equal(maxeyBalance / 2n);
  });

  it("should allow master creating a new game", async function () {
    // const balance = await usdc.balanceOf(challenger.getAddress());
    // console.log("balance of challenger: @@@", balance.toString());
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
    // const filter = tokemoGoFactory.filters.GameCreated();
    // const events = await tokemoGoFactory.queryFilter(filter);
    // const gameAddress = events[0].args.gameAddress;
    // console.log("Game Address:", gameAddress);

    const deployedGames = await tokemoGoFactory.getDeployedGames();
    expect(deployedGames.length).to.equal(1);
  });

  it("should allow master to create the game, and challenger to join the game", async function () {
    const masterBalanceBefore = await usdc.balanceOf(maxeyAddress);
    console.log(
      "Master USDT Balance Before Game Ended:",
      masterBalanceBefore.toString()
    );

    const challengerBalanceBefore = await usdc.balanceOf(
      challenger.getAddress()
    );
    console.log(
      "Challenger USDT Balance Before Game Ended:",
      challengerBalanceBefore.toString()
    );
    const assetValue = 10n;
    const now = Math.floor(Date.now() / 1000); // 获取当前时间的UNIX时间戳（秒）
    const endTime = now + 43200; // 0.5 day from now

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
    const usdtAmount = 5n;
    // 准备TokenInfo数组
    const masterAssetArray = [
      {
        token: usdc.getAddress(),
        amount: usdtAmount,
      },
    ];

    // Master向游戏合约抵押USDT
    const depositAmount = 10n;
    await usdc.connect(impMaxey).approve(tokemoGo.getAddress(), depositAmount);
    await expect(
      tokemoGo
        .connect(impMaxey)
        .depositUSDT(depositAmount, masterAssetArray, YDAddress)
    )
      .to.emit(tokemoGo, "DepositUSDT")
      .withArgs(await maxeyAddress, depositAmount, usdtAmount);

    // show the master's USDC balance
    const masterBal = await usdc.balanceOf(maxeyAddress);
    console.log("Master USDT Balance After Deposit:", masterBal.toString());

    // 验证抵押后的游戏合约状态
    const gameMasterDetails = await tokemoGo.gameMasterDetails();
    expect(gameMasterDetails.valueInU).to.equal(depositAmount);

    // Challenger向游戏合约抵押USDT
    const challengerDeposit = 10n;
    const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const wethAmount = 4n;
    const wethPrice = 2;
    const challengerAssetArray = [
      {
        token: wethAddress, // WETH
        amount: wethAmount,
      },
    ];
    await usdc
      .connect(challenger)
      .approve(tokemoGo.getAddress(), depositAmount);
    await expect(
      tokemoGo
        .connect(challenger)
        .depositUSDT(challengerDeposit, challengerAssetArray, maxeyCoinAddress)
    )
      .to.emit(tokemoGo, "DepositUSDT")
      .withArgs(
        await challenger.getAddress(),
        challengerDeposit,
        wethAmount * 2n
      );

    // 验证抵押后的游戏合约状态
    const challengerDetails = await tokemoGo.challengerDetails();
    // console.log("Challenger Details:", challengerDetails);
    // console.log("Master Details:", gameMasterDetails);
    expect(challengerDetails.valueInU).to.equal(depositAmount);

    // 检查游戏是否已经开始
    const gameStarted = await tokemoGo.gameStarted();
    expect(gameStarted).to.be.true;
    const masterValue: bigint = await tokemoGo.getGameMasterValue();
    //console.log("Master Asset Value For Now:", masterValue);
    const challengerValue: bigint = await tokemoGo.getChallengerValue();
    //console.log("Challenger Asset Value For Now:", challengerValue);

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

    // const YDTokenBalance = await YDToken.balanceOf(tokemoGo.getAddress());
    // console.log("--- YD Token Balance of Game ---:", YDTokenBalance.toString());
    // console.log(
    //   "--- Maxey Token Balance of TokemoGo ---:",
    //   await maxeyToken.balanceOf(tokemoGo.getAddress())
    // );

    // 快进时间以确保当前时间超过游戏的endTime
    await ethers.provider.send("evm_increaseTime", [86400 * 30]); // 快进一天加一秒
    await ethers.provider.send("evm_mine", []); // 挖掘新的区块以确认时间变化
    console.log(
      "--- YD Token Balance of challenger ---:",
      await YDToken.balanceOf(await challenger.getAddress())
    );
    console.log(
      "--- Maxey Token Balance of challenger ---:",
      await maxeyToken.balanceOf(await challenger.getAddress())
    );

    console.log(
      "--- Maxey Token Balance of tokemoGo ---:",
      await maxeyToken.balanceOf(await tokemoGo.getAddress())
    );
    // 结束游戏
    await expect(tokemoGo.connect(impMaxey).endGame()).to.emit(
      tokemoGo,
      "GameEnded"
    );

    console.log("\nGame Ended\n");

    const masterBalance = await usdc.balanceOf(maxeyAddress);
    console.log(
      "Master USDT Balance After Game Ended:",
      masterBalance.toString()
    );

    const challengerBalance = await usdc.balanceOf(challenger.getAddress());
    console.log(
      "Challenger USDT Balance After Game Ended:",
      challengerBalance.toString()
    );

    console.log(
      "--- YD Token Balance of challenger ---:",
      await YDToken.balanceOf(await challenger.getAddress())
    );
    console.log(
      "--- Maxey Token Balance of challenger ---:",
      await maxeyToken.balanceOf(await challenger.getAddress())
    );

    console.log(
      "--- Maxey Token Balance of tokemoGo ---:",
      await maxeyToken.balanceOf(await tokemoGo.getAddress())
    );

    console.log("Challenger address:", await challenger.getAddress());
  });
});
