import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TokemoGoModule = buildModule("TokemoGoModule", (m) => {
  const tokemoGoFactory = m.contract("TokemoGoFactory");

  return { tokemoGoFactory };
});

export default TokemoGoModule;
//0xac5527E09fF35d383df42Cf838eBc62737c15036
