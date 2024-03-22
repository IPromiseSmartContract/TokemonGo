import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const JAN_1ST_2030 = 1893456000;
const ONE_GWEI: bigint = 1_000_000_000n;

const TokemoGoModule = buildModule("TokemoGoModule", (m) => {
  const tokemoGoFactory = m.contract("TokemoGoFactory");

  return { tokemoGoFactory };
});

export default TokemoGoModule;
// import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// const JAN_1ST_2030 = 1893456000;
// const ONE_GWEI: bigint = 1_000_000_000n;

// const TokemoGoModule = buildModule("TokemoGoModule", (m) => {
//   //const tokemoGoFactory = m.contract("TokemoGoFactory");
//   const tokemoGoFactory = m.contractAt(
//     "TokemoGoFactory",
//     "0x3d8255966Fde9ae46A731f765b58b25a51A32831"
//   );

//   m.call(tokemoGoFactory, "createGame", [
//     "0xFA0bd2B4d6D629AdF683e4DCA310c562bCD98E4E",
//     10n * 1000000n,
//     Math.floor(Date.now() / 1000) + 100,
//   ]);

//   return { tokemoGoFactory };
// });

// export default TokemoGoModule;
