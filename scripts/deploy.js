const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const Factory = await hre.ethers.getContractFactory("CouponVerification");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  const artifact = await hre.artifacts.readArtifact("CouponVerification");
  const output = { address, abi: artifact.abi, network: hre.network.name, deployedAt: new Date().toISOString() };
  const target = path.join(__dirname, "..", "backend", "config", "contract.json");
  fs.writeFileSync(target, JSON.stringify(output, null, 2));
  console.log(`CouponVerification deployed at ${address}; saved ${target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
