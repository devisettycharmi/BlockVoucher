// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CouponVerification {
    struct Coupon {
        string couponId;
        string name;
        uint8 discountType;
        uint256 discountValue;
        uint256 expiresAt;
        uint256 maxRedemptions;
        uint256 redemptionCount;
        bool exists;
        bool active;
    }

    address public immutable admin;
    mapping(address => bool) public authorizedMerchants;
    mapping(bytes32 => Coupon) private coupons;

    event CouponCreated(bytes32 indexed couponKey, string couponId, address indexed creator);
    event CouponRedeemed(bytes32 indexed couponKey, string couponId, address indexed merchant, uint256 timestamp);
    event MerchantAuthorizationChanged(address indexed merchant, bool authorized);
    event CouponDeactivated(bytes32 indexed couponKey, address indexed admin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyMerchant() {
        require(authorizedMerchants[msg.sender], "Merchant not authorized");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createCoupon(
        string calldata couponId,
        string calldata name,
        uint8 discountType,
        uint256 discountValue,
        uint256 expiresAt,
        uint256 maxRedemptions
    ) external onlyAdmin {
        require(bytes(couponId).length > 0, "Coupon ID required");
        require(bytes(name).length > 0, "Name required");
        require(discountType <= 1, "Invalid discount type");
        require(discountValue > 0, "Discount must be positive");
        require(expiresAt > block.timestamp, "Expiry must be in future");
        require(maxRedemptions > 0, "Redemptions must be positive");
        bytes32 key = keccak256(bytes(couponId));
        require(!coupons[key].exists, "Coupon already exists");
        coupons[key] = Coupon(couponId, name, discountType, discountValue, expiresAt, maxRedemptions, 0, true, true);
        emit CouponCreated(key, couponId, msg.sender);
    }

    function verifyCoupon(string calldata couponId) external view returns (bool valid, uint8 reason) {
        Coupon storage coupon = coupons[keccak256(bytes(couponId))];
        if (!coupon.exists) return (false, 1);
        if (!coupon.active) return (false, 2);
        if (coupon.expiresAt <= block.timestamp) return (false, 3);
        if (coupon.redemptionCount >= coupon.maxRedemptions) return (false, 4);
        return (true, 0);
    }

    function redeemCoupon(string calldata couponId) external onlyMerchant {
        Coupon storage coupon = coupons[keccak256(bytes(couponId))];
        require(coupon.exists, "Coupon does not exist");
        require(coupon.active, "Coupon deactivated");
        require(coupon.expiresAt > block.timestamp, "Coupon expired");
        require(coupon.redemptionCount < coupon.maxRedemptions, "Redemption limit reached");
        coupon.redemptionCount += 1;
        emit CouponRedeemed(keccak256(bytes(couponId)), couponId, msg.sender, block.timestamp);
    }

    function getCouponDetails(string calldata couponId) external view returns (
        string memory name,
        uint8 discountType,
        uint256 discountValue,
        uint256 expiresAt,
        uint256 maxRedemptions,
        uint256 redemptionCount,
        bool active
    ) {
        Coupon storage coupon = coupons[keccak256(bytes(couponId))];
        require(coupon.exists, "Coupon does not exist");
        return (coupon.name, coupon.discountType, coupon.discountValue, coupon.expiresAt, coupon.maxRedemptions, coupon.redemptionCount, coupon.active);
    }

    function authorizeMerchant(address merchant) external onlyAdmin {
        require(merchant != address(0), "Invalid merchant");
        authorizedMerchants[merchant] = true;
        emit MerchantAuthorizationChanged(merchant, true);
    }

    function revokeMerchant(address merchant) external onlyAdmin {
        authorizedMerchants[merchant] = false;
        emit MerchantAuthorizationChanged(merchant, false);
    }

    function deactivateCoupon(string calldata couponId) external onlyAdmin {
        bytes32 key = keccak256(bytes(couponId));
        require(coupons[key].exists, "Coupon does not exist");
        coupons[key].active = false;
        emit CouponDeactivated(key, msg.sender);
    }
}
