import { ethers } from "hardhat";

async function main() {
  // 替换为实际的TokemoGo合约地址和impMaxey的私钥
  const tokemoGoAddress = "0x14ECe9d35AD08BD9149ae02C33Fa546C837EDb3D";

  // 获取TokemoGo合约实例
  const tokemoGo = await ethers.getContractAt("TokemoGo", tokemoGoAddress);

  // 结束游戏
  console.log("Ending the game...");
  const tx = await tokemoGo.endGame();
  await tx.wait(); // 等待交易被矿工确认
  console.log("Game ended successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
