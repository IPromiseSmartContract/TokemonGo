import { ethers } from "hardhat";
import { TokemoGoFactory } from "../typechain-types";

async function main() {
  // TokemoGoFactory合约地址
  const factoryAddress = "0x3d8255966Fde9ae46A731f765b58b25a51A32831";

  // 连接到已部署的TokemoGoFactory合约
  const tokemoGoFactory = (await ethers.getContractAt(
    "TokemoGoFactory",
    factoryAddress
  )) as TokemoGoFactory;

  // 定义createGame函数的参数
  const tokenAddress = "0xFA0bd2B4d6D629AdF683e4DCA310c562bCD98E4E"; // 举例：USDC的地址
  const assetValue = ethers.parseUnits("10", 6); // 假设token有6位小数，创建游戏的资产价值为100
  const now = Math.floor(Date.now() / 1000);
  const endTime = now + 1800; // 游戏结束时间，比如从现在起的一天后

  // 调用createGame函数创建新游戏
  const tx = await tokemoGoFactory.createGame(
    tokenAddress,
    assetValue,
    endTime
  );
  await tx.wait(); // 等待交易被矿工确认

  console.log("Game created successfully!");

  // 示例：调用getDeployedGames()函数来获取所有已部署的游戏地址
  const deployedGames = await tokemoGoFactory.getDeployedGames();
  console.log("Deployed Games:", deployedGames);

  const gameInfo = await tokemoGoFactory.getGameInfo();
  console.log("Game Info:", gameInfo);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
