const router = require("express").Router();
const deployment = require("../config/contract.json");

router.get("/", (req, res) => {
  const address = process.env.CONTRACT_ADDRESS || deployment.address;
  if (!address || !deployment.abi.length) return res.status(503).json({ message: "Contract deployment is not configured" });
  res.json({ address, abi: deployment.abi, chainId: 31337 });
});

module.exports = router;
