import { ethers } from "hardhat";
import { TokemoGoFactory } from "../typechain-types";

async function main() {
  // TokemoGoFactory合约地址
  const factoryAddress = "0xac5527E09fF35d383df42Cf838eBc62737c15036";

  // 连接到已部署的TokemoGoFactory合约
  const tokemoGoFactory = (await ethers.getContractAt(
    "TokemoGoFactory",
    factoryAddress
  )) as TokemoGoFactory;

  // 示例：调用getDeployedGames()函数来获取所有已部署的游戏地址
  const deployedGames = await tokemoGoFactory.getDeployedGames();
  console.log("Deployed Games:", deployedGames);

  const gameInfo = await tokemoGoFactory.getGameInfo();
  console.log("Game Info:", gameInfo);

  // const tokemoGoAddress = "0x14ECe9d35AD08BD9149ae02C33Fa546C837EDb3D";
  // const tokemoGo = await ethers.getContractAt("TokemoGo", tokemoGoAddress);
  // const gameMasterDetails = await tokemoGo.gameMasterDetails();
  // console.log("Game Master Details:", gameMasterDetails);
  // const gameChallengerDetails = await tokemoGo.challengerDetails();
  // console.log("Game Challenger Details:", gameChallengerDetails);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
