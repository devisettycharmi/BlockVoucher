const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDatabase = require("./config/db");

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "BlockVoucher API" }));
app.use("/api/chain", require("./routes/chain"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/coupons", require("./routes/coupons"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/merchants", require("./routes/merchants"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/users", require("./routes/users"));
app.use("/api/contact", require("./routes/contact"));
app.use((req, res) => res.status(404).json({ message: "Endpoint not found" }));
app.use((error, req, res, next) => {
  console.error(error);
  if (error.code === 11000) return res.status(409).json({ message: "A record with that value already exists" });
  res.status(500).json({ message: error.reason?.shortMessage || error.message || "Internal server error" });
});

const port = Number(process.env.PORT || 4000);
connectDatabase()
  .then(() => app.listen(port, () => console.log(`BlockVoucher API listening on ${port}`)))
  .catch((error) => { console.error("API startup failed:", error); process.exitCode = 1; });
