import { ethers } from "hardhat";

async function main() {
  // 替换为实际的合约地址
  const usdcAddress = "0xFA0bd2B4d6D629AdF683e4DCA310c562bCD98E4E";
  const tokemoGoAddress = "0x9f866FB707Bc1724747F7Bb00Cd83b0F32070269";
  const ydAddress = "0xdfe35d04C1270b2c94691023511009329e74E7f9";

  // 获取USDC合约实例
  const usdc = await ethers.getContractAt("ERC20", usdcAddress);

  // 获取游戏合约实例
  const tokemoGo = await ethers.getContractAt("TokemoGo", tokemoGoAddress);

  // 授权USDC给游戏合约
  const MaxInt256 = ethers.MaxUint256;
  await usdc.approve(tokemoGoAddress, MaxInt256);
  console.log(`Successfully approved USDC to ${tokemoGoAddress}`);

  // 准备TokenInfo数组和抵押金额
  const usdtAmount = ethers.parseUnits("5", 6); // 假设USDC有6位小数
  const depositAmount = ethers.parseUnits("10", 6); // 抵押金额为10 USDC

  const masterAssetArray = [
    {
      token: usdcAddress,
      amount: usdtAmount.toString(),
    },
  ];

  // 向游戏合约抵押USDC
  const tx = await tokemoGo.depositUSDT(
    depositAmount,
    masterAssetArray,
    ydAddress
  );
  await tx.wait();

  console.log(`Successfully deposited ${depositAmount} USDC to the game`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
