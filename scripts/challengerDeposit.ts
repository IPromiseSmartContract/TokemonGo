import { ethers } from "hardhat";

async function main() {
  // 替换以下地址为实际的合约地址和账户地址
  const usdcAddress = "0xFA0bd2B4d6D629AdF683e4DCA310c562bCD98E4E"; // USDC合约地址
  const tokemoGoAddress = "0x9f866FB707Bc1724747F7Bb00Cd83b0F32070269"; // TokemoGo合约地址
  const challengerPrivateKey =
    "fe1c40adf3d73dc88d0a1ee889d16b8892413ea541a9ddcd12ccea67fc84a64d"; // Challenger的私钥

  // 连接到USDC代币合约
  const usdc = await ethers.getContractAt("ERC20", usdcAddress);

  // 使用challenger私钥创建一个新的Wallet并连接到提供者(provider)
  const provider = ethers.provider;
  const challenger = new ethers.Wallet(challengerPrivateKey, provider);

  // 连接到游戏合约
  const tokemoGo = await ethers.getContractAt(
    "TokemoGo",
    tokemoGoAddress,
    challenger
  );

  // 授权操作：允许游戏合约从challenger账户中转出最大量的USDC
  console.log("Approving USDC for the game contract...");
  const MaxInt256 = ethers.MaxUint256;
  await usdc.connect(challenger).approve(tokemoGo.getAddress(), MaxInt256);

  // 获取challenger的USDC余额，仅用于确认，实际可能不需要这一步
  const challengerBal = await usdc.balanceOf(challenger.address);
  console.log(
    `Challenger USDC balance: ${ethers.formatUnits(challengerBal, 6)}`
  );

  // 定义存款金额和资产数组
  const depositAmount = ethers.parseUnits("10", 6); // 假设存款金额为10 USDC
  const wethAddress = "0xf531B8F309Be94191af87605CfBf600D71C2cFe0";
  const wethAmount = ethers.parseEther("1") / 1000n;
  const challengerAssetArray = [
    {
      token: wethAddress,
      amount: wethAmount.toString(),
    },
  ];
  const maxeyCoinAddress = "0x14178B278CB9ec021d538Df3e6f16F476EfE0301"; // MaxeyCoin合约地址

  // 向游戏合约存入USDC
  console.log("Depositing USDC to the game contract...");
  await tokemoGo
    .connect(challenger)
    .depositUSDT(depositAmount, challengerAssetArray, maxeyCoinAddress);

  console.log("Deposit completed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
