import { ethers } from "hardhat";
import { expect } from "chai";
import { Signer } from "ethers";
import { USDTMock, TokemoGoFactory, TokemoGo } from "../typechain-types";

describe("TokemoGoFactory", function () {
  let tokemoGoFactory: TokemoGoFactory;
  let usdtMock: USDTMock;
  let master: Signer;
  let challenger: Signer;
  let tokemoGo: TokemoGo;

  beforeEach(async function () {
    // 获取账户
    [master, challenger] = await ethers.getSigners();

    // 部署USDT模拟合约
    const USDTMock = await ethers.getContractFactory("USDTMock");
    usdtMock = await USDTMock.deploy();

    // 部署TokemoGoFactory
    const TokemoGoFactory = await ethers.getContractFactory("TokemoGoFactory");
    tokemoGoFactory = await TokemoGoFactory.deploy();
    // await tokemoGoFactory.deployed();

    const mintAmount = 100n;
    await usdtMock
      .connect(challenger)
      .mint(challenger.getAddress(), mintAmount);
  });

  it("master should have USDT after deployment", async function () {
    const balance = await usdtMock.balanceOf(master.getAddress());
    //console.log("Balance of Master", balance.toString());
    expect(balance).to.equal(100n);
  });

  it("should mint USDT to challenger", async function () {
    const balance = await usdtMock.balanceOf(challenger.getAddress());
    //console.log("Balance of Challenger", balance.toString());
    expect(balance).to.equal(100n);
  });

  it("should allow creating a new game", async function () {
    const assetValue = ethers.parseUnits("100", 6);
    const now = Math.floor(Date.now() / 1000); // 获取当前时间的UNIX时间戳（秒）
    const endTime = now + 86400; // 1 day from now

    await expect(
      tokemoGoFactory.createGame(usdtMock.getAddress(), assetValue, endTime)
    )
      .to.emit(tokemoGoFactory, "GameCreated")
      .withArgs(ethers.isAddress, master.getAddress(), assetValue, endTime);
    // const filter = tokemoGoFactory.filters.GameCreated();
    // const events = await tokemoGoFactory.queryFilter(filter);
    // const gameAddress = events[0].args.gameAddress;
    // console.log("Game Address:", gameAddress);

    const deployedGames = await tokemoGoFactory.getDeployedGames();
    expect(deployedGames.length).to.equal(1);
  });

  it("should allow master to create the game, and challenger to join the game", async function () {
    const masterBalanceBefore = await usdtMock.balanceOf(master.getAddress());
    console.log(
      "Master USDT Balance Before Game Ended:",
      masterBalanceBefore.toString()
    );

    const challengerBalanceBefore = await usdtMock.balanceOf(
      challenger.getAddress()
    );
    console.log(
      "Challenger USDT Balance Before Game Ended:",
      challengerBalanceBefore.toString()
    );
    const assetValue = 10n;
    const now = Math.floor(Date.now() / 1000); // 获取当前时间的UNIX时间戳（秒）
    const endTime = now + 86400; // 1 day from now

    // 创建新游戏并获取游戏地址
    const createGameTx = await tokemoGoFactory.createGame(
      await usdtMock.getAddress(),
      assetValue,
      endTime
    );
    const receipt = await createGameTx.wait();
    const filter = tokemoGoFactory.filters.GameCreated();
    const events = await tokemoGoFactory.queryFilter(filter);
    const gameAddress = events[0].args.gameAddress;
    expect(gameAddress).to.not.be.undefined;

    // 使用获取的游戏地址与游戏合约交互
    tokemoGo = await ethers.getContractAt("TokemoGo", gameAddress);
    const usdtAmount = 5n;
    // 准备TokenInfo数组
    const masterAssetArray = [
      {
        token: usdtMock.getAddress(),
        amount: usdtAmount,
      },
    ];

    // Master向游戏合约抵押USDT
    const depositAmount = 10n;
    await usdtMock
      .connect(master)
      .approve(tokemoGo.getAddress(), depositAmount);
    await expect(
      tokemoGo.connect(master).depositUSDT(depositAmount, masterAssetArray)
    )
      .to.emit(tokemoGo, "DepositUSDT")
      .withArgs(await master.getAddress(), depositAmount, usdtAmount);

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

    await usdtMock
      .connect(challenger)
      .approve(tokemoGo.getAddress(), depositAmount);
    await expect(
      tokemoGo
        .connect(challenger)
        .depositUSDT(challengerDeposit, challengerAssetArray)
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

    // 快进时间以确保当前时间超过游戏的endTime
    await ethers.provider.send("evm_increaseTime", [86400 + 1]); // 快进一天加一秒
    await ethers.provider.send("evm_mine", []); // 挖掘新的区块以确认时间变化

    // 结束游戏
    await expect(tokemoGo.connect(master).endGame()).to.emit(
      tokemoGo,
      "GameEnded"
    );

    // // 获取并打印游戏结束后的赢家信息
    // const winnerAddress = await challenger.getAddress();
    // console.log("Winner Address:", winnerAddress);

    // // 根据游戏逻辑和测试设定，验证赢家收到的奖励
    // // 例如，检查赢家的USDT余额是否增加了预期的奖励金额
    // const winnerBalance = await usdtMock.balanceOf(winnerAddress);
    // console.log(
    //   "Winner USDT Balance After Game Ended:",
    //   winnerBalance.toString()
    // );

    const masterBalance = await usdtMock.balanceOf(master.getAddress());
    console.log(
      "Master USDT Balance After Game Ended:",
      masterBalance.toString()
    );

    const challengerBalance = await usdtMock.balanceOf(challenger.getAddress());
    console.log(
      "Challenger USDT Balance After Game Ended:",
      challengerBalance.toString()
    );
  });
});
