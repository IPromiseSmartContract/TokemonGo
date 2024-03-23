import { ethers } from "hardhat";

async function main() {
  // 代替以下地址和私钥为实际值
  const ydTokenAddress = "0xdfe35d04C1270b2c94691023511009329e74E7f9";
  const maxeyTokenAddress = "0x14178B278CB9ec021d538Df3e6f16F476EfE0301";
  const tokemoGoAddress = "0x14ECe9d35AD08BD9149ae02C33Fa546C837EDb3D";

  // 获取代币合约和游戏合约的实例
  const YDToken = await ethers.getContractAt("ERC20", ydTokenAddress);
  const maxeyToken = await ethers.getContractAt("ERC20", maxeyTokenAddress);
  const tokemoGo = await ethers.getContractAt("TokemoGo", tokemoGoAddress);

  const MaxInt256 = ethers.MaxUint256;
  await YDToken.approve(tokemoGo.getAddress(), MaxInt256);
  await tokemoGo.betForGameMaster(100000);

  // challenger 授权并下注为挑战者
  console.log("Challenger is approving and betting...");
  await maxeyToken.approve(tokemoGo.getAddress(), MaxInt256);
  await tokemoGo.betForChallenger(100000);

  console.log("Bets placed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
