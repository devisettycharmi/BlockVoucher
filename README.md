# BlockVoucher

BlockVoucher is a full-stack academic demo of issuing, QR-verifying, and redeeming coupons with an Ethereum smart contract. Coupon validity and redemption limits are checked on-chain; MongoDB stores application metadata and user records.

## Requirements

- Node.js 20+
- MongoDB Community running locally (or a MongoDB connection URI)
- MetaMask (optional for connecting a browser wallet; the demo's API signs blockchain writes with a local Hardhat account)

## Install

From this directory:

```powershell
npm install
npm --prefix backend install
npm --prefix frontend install
Copy-Item .env.example backend\.env
```

Set `JWT_SECRET` to a long random value in `backend\.env`. For the local demo, set `BLOCKCHAIN_PRIVATE_KEY` to Hardhat's first account key and `DEMO_MERCHANT_PRIVATE_KEY` to its second account key. Link/authorize that second account for the merchant. These keys are only for local demonstration and must never be used on a public network. Keep private keys out of frontend variables and source control.

## Run the local demonstration

Open separate terminals in the project directory:

1. Start a local Ethereum chain: `npx hardhat node`
2. Deploy the contract: `npm run compile` then `npm run deploy:local`
3. Start MongoDB. The default URI is `mongodb://127.0.0.1:27017/blockvoucher`.
4. Start the API: `npm run dev:backend`
5. In another terminal, seed the admin account: `npm run seed:admin`
6. Start the frontend: `npm run dev:frontend`
7. Open `http://localhost:5173`.

The seed command reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `backend\.env`. Use a password at least 12 characters long. Public registration creates only customer or merchant accounts.

Create customer and merchant accounts through the registration page. No demo customer or merchant credentials are included in the repository.

## End-to-end flow

1. Register a customer and a merchant from the registration page, then log in as the seeded admin.
2. Create a coupon, select the customer who will receive it, and set a future expiry. BlockVoucher creates a unique ID, registers a one-time coupon on-chain, and shows its QR for download.
3. The assigned customer logs in to see the coupon ID and download its QR image. Coupons assigned to another customer are not shown.
4. A merchant links an Ethereum address in the merchant dashboard. The admin authorizes the merchant; authorization is written to the contract.
5. Log in as the merchant and upload the customer's QR image. The API submits the redemption with the configured local demo merchant signer; after the transaction confirms on-chain, the page displays **Coupon redeemed successfully**.
6. Upload the same image again. The smart contract reports that the one-time coupon was already used, and the page displays **Invalid — already used**.

For local demonstrations, set `DEMO_MERCHANT_PRIVATE_KEY` to a Hardhat test account key and link/authorize its address for the merchant account. This key is used only by the backend and is never sent to the browser. The API verifies the mined redemption event before recording metadata. These local demo keys are public test keys; do not use them on a public network.

## API

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`
- `GET /api/coupons`, `GET /api/coupons/:id`, `POST /api/coupons`
- `POST /api/coupons/verify`, `POST /api/coupons/redeem`
- `GET /api/admin/merchants`, `/customers`, `/transactions`, `/stats`
- `GET /api/merchants`, `POST /api/merchants/authorize`
- `GET /api/transactions` (admin or merchant), `PUT /api/users/wallet`
- `POST /api/contact`
- `GET /api/health`

All protected routes use bearer JWTs. Admin accounts are created only with the seed script. Never use a Hardhat development key on a public network.

## Tests

```powershell
npm run test:contract
npm --prefix frontend run build
```

The contract tests cover creation, existence/expiry checks, authorization, duplicate redemption, and admin-only operations.

## Project layout

- `frontend/` React, Router, responsive UI, API client, QR generation/scanning
- `backend/` Express REST API, JWT auth, MongoDB models, and blockchain service
- `contracts/` Solidity coupon verification contract
- `scripts/` local deployment script; deployed ABI/address are saved in `backend/config/contract.json`
- `test/` Hardhat contract tests
