const { ethers } = require("ethers");
const deployment = require("./contract.json");

function getContract({ signer = false, privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY } = {}) {
  const address = process.env.CONTRACT_ADDRESS || deployment.address;
  if (!address) throw new Error("Contract not deployed. Run npm run deploy:local first.");
  const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545");
  let connection = provider;
  if (signer) {
    if (!privateKey) throw new Error("A blockchain signing key is required for this action");
    connection = new ethers.Wallet(privateKey, provider);
  }
  return new ethers.Contract(address, deployment.abi, connection);
}

module.exports = { getContract };
