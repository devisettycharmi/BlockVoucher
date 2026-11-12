const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CouponVerification", function () {
  async function deploy() {
    const [admin, merchant, stranger] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CouponVerification");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();
    const expiry = BigInt((await ethers.provider.getBlock("latest")).timestamp) + 3600n;
    return { contract, admin, merchant, stranger, expiry };
  }

  it("creates and verifies coupons; prevents duplicate IDs", async function () {
    const { contract, expiry } = await deploy();
    await contract.createCoupon("BV-001", "Welcome", 0, 20, expiry, 1);
    expect(await contract.verifyCoupon("BV-001")).to.deep.equal([true, 0n]);
    await expect(contract.createCoupon("BV-001", "Again", 0, 5, expiry, 1)).to.be.revertedWith("Coupon already exists");
    expect(await contract.verifyCoupon("missing")).to.deep.equal([false, 1n]);
  });

  it("requires authorization and atomically rejects duplicate redemption", async function () {
    const { contract, admin, merchant, stranger, expiry } = await deploy();
    await contract.createCoupon("BV-002", "One time", 0, 20, expiry, 1);
    await expect(contract.connect(stranger).redeemCoupon("BV-002")).to.be.revertedWith("Merchant not authorized");
    await contract.authorizeMerchant(merchant.address);
    await contract.connect(merchant).redeemCoupon("BV-002");
    expect(await contract.verifyCoupon("BV-002")).to.deep.equal([false, 4n]);
    await expect(contract.connect(merchant).redeemCoupon("BV-002")).to.be.revertedWith("Redemption limit reached");
    await expect(contract.connect(merchant).authorizeMerchant(stranger.address)).to.be.revertedWith("Only admin");
    await expect(contract.connect(merchant).createCoupon("BV-003", "No", 0, 10, expiry, 1)).to.be.revertedWith("Only admin");
    expect(admin.address).to.equal(await contract.admin());
  });

  it("rejects expired coupons and permits deactivation", async function () {
    const { contract, expiry } = await deploy();
    await contract.createCoupon("BV-004", "Expiry", 0, 20, expiry, 2);
    await ethers.provider.send("evm_setNextBlockTimestamp", [Number(expiry + 1n)]);
    await ethers.provider.send("evm_mine");
    expect(await contract.verifyCoupon("BV-004")).to.deep.equal([false, 3n]);
    await expect(contract.deactivateCoupon("BV-004")).not.to.be.reverted;
  });
});
