import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ArrowUpRight, Blocks, CircleUserRound, ShieldCheck } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import api from "./services/api";
import QRCode from "qrcode";
import { Html5Qrcode } from "html5-qrcode";
import SiteLayout from "./layouts/SiteLayout";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

function Home() {
  return <SiteLayout><section className="hero container">
    <div className="hero-copy"><div className="eyebrow"><span className="pulse-dot" /> TRUSTED ON-CHAIN. MADE FOR REAL LIFE.</div>
      <h1>Coupons you can<br /><span>actually trust.</span></h1>
      <p className="hero-description">Issue, verify, and redeem digital vouchers with the transparency of Ethereum. One coupon. One redemption. No room for fraud.</p>
      <div className="hero-actions"><Link to="/register" className="button">Start using BlockVoucher <ArrowUpRight size={17} /></Link><Link to="/about" className="button button-ghost">Explore the platform</Link></div>
      <div className="hero-proof"><span><ShieldCheck size={16} /> Tamper-resistant</span><span><Blocks size={16} /> Ethereum verified</span></div>
    </div>
    <div className="hero-art"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="coupon-preview"><div className="coupon-top"><span className="mini-logo"><Blocks size={16} /></span><span className="verified-tag"><ShieldCheck size={13} /> ON-CHAIN</span></div><div className="discount">20<span>%</span></div><div className="coupon-label">OFF YOUR NEXT ORDER</div><div className="coupon-divider" /><div className="coupon-bottom"><span>BV-8F2A91C0</span><span className="barcode">▥▦▥▥▦▥▦</span></div></div><div className="floating-badge badge-top"><span className="badge-icon"><ShieldCheck size={16} /></span><div><b>Verified on Ethereum</b><small>Block #19,482,601</small></div></div><div className="floating-badge badge-bottom"><span className="live-dot" /> <b>One-time redemption</b></div></div>
  </section>
  <section className="trust-strip container"><span>BUILT WITH TRUST AT THE CORE</span><div><span><Blocks /> Ethereum</span><span><ShieldCheck /> On-chain security</span><span><CircleUserRound /> Role-based access</span></div></section>
  <section className="section container"><div className="section-heading"><span className="eyebrow">THE OLD WAY IS BROKEN</span><h2>Coupons should reward trust.<br /><span>Not invite fraud.</span></h2></div><div className="feature-grid"><article className="feature-card"><div className="feature-icon purple"><ShieldCheck /></div><h3>Authentic by design</h3><p>Every coupon is registered on Ethereum, making forged or altered vouchers easy to spot.</p></article><article className="feature-card"><div className="feature-icon blue"><Blocks /></div><h3>One redemption. Guaranteed.</h3><p>Atomic smart contract updates stop duplicate use at the source, not just in the UI.</p></article><article className="feature-card"><div className="feature-icon green"><CircleUserRound /></div><h3>Access that makes sense</h3><p>Dedicated admin, merchant, and customer roles keep every action in the right hands.</p></article></div></section>
  <section className="how-section"><div className="container"><div className="section-heading"><span className="eyebrow">THREE STEPS. ZERO GUESSWORK.</span><h2>From issued to redeemed,<br /><span>every step verified.</span></h2></div><div className="steps"><div className="step"><span>01</span><h3>Issue</h3><p>An admin creates a coupon and registers its terms on the blockchain.</p></div><div className="step"><span>02</span><h3>Verify</h3><p>A merchant scans the QR and checks its validity against on-chain data.</p></div><div className="step"><span>03</span><h3>Redeem</h3><p>The smart contract records redemption atomically. No second use.</p></div></div></div></section>
  <section className="cta container"><div><span className="eyebrow">WELCOME TO BLOCKVOUCHER</span><h2>Good deals.<br /><span>Solid proof.</span></h2><p>Bring verifiable trust to every coupon.</p></div><Link to="/register" className="button">Create your account <ArrowUpRight size={16} /></Link></section>
  </SiteLayout>;
}

function AuthPage({ mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "customer" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";
  async function submit(event) {
    event.preventDefault(); setError("");
    if (isRegister && form.password !== form.confirmPassword) return setError("Passwords do not match.");
    setBusy(true);
    try { const user = isRegister ? await register(form) : await login(form); navigate(user.role === "merchant" || user.role === "admin" ? "/dashboard" : "/dashboard"); }
    catch (e) { setError(e.response?.data?.message || "Could not connect to BlockVoucher API."); }
    finally { setBusy(false); }
  }
  return <SiteLayout><section className="auth-page container"><div className="auth-card"><div className="auth-icon"><ShieldCheck /></div><span className="eyebrow">{isRegister ? "JOIN BLOCKVOUCHER" : "WELCOME BACK"}</span><h1>{isRegister ? "Create your account" : "Good to see you."}</h1><p>{isRegister ? "Your next trusted coupon starts here." : "Sign in to continue to your dashboard."}</p>
    <form onSubmit={submit}>{isRegister && <><label>Full name<input required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Morgan" /></label><label>Account type<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="customer">Customer</option><option value="merchant">Merchant</option></select></label></>}
      <label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
      <label>Password<input required minLength={8} type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" /></label>
      {isRegister && <label>Confirm password<input required type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Re-enter your password" /></label>}
      {error && <div className="form-error">{error}</div>}<button disabled={busy} className="button form-submit">{busy ? "Please wait…" : isRegister ? "Create account" : "Log in"} <ArrowUpRight size={16} /></button>
    </form><div className="auth-switch">{isRegister ? <>Already a member? <Link to="/login">Log in</Link></> : <>New to BlockVoucher? <Link to="/register">Create an account</Link></>}</div><small className="admin-note">Administrator access is provisioned securely; public admin registration is disabled.</small>
  </div></section></SiteLayout>;
}

function Protected({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading your secure session…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function Dashboard() {
  const { user, updateWalletAddress } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [qrImages, setQrImages] = useState({});
  const [stats, setStats] = useState({});
  const [merchants, setMerchants] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notice, setNotice] = useState("");
  const [walletAddress, setWalletAddress] = useState(user.walletAddress || "");
  const [form, setForm] = useState({ name: "", description: "", discountType: "percentage", discountValue: "20", expiresAt: "", customerId: "", merchantId: "" });
  const [qr, setQr] = useState(null);

  async function load() {
    const [couponResponse] = await Promise.all([api.get("/coupons")]);
    setCoupons(couponResponse.data.coupons);
    if (user.role === "customer") {
      const images = await Promise.all(couponResponse.data.coupons.map(async (coupon) => [
        coupon._id,
        await QRCode.toDataURL(coupon.couponId, { width: 560, margin: 3, color: { dark: "#111827", light: "#ffffff" } })
      ]));
      setQrImages(Object.fromEntries(images));
    }
    if (user.role === "merchant") {
      const { data } = await api.get("/transactions");
      setTransactions(data.transactions);
    }
    if (user.role === "admin") {
      const [statsResponse, merchantResponse, customerResponse, txResponse] = await Promise.all([api.get("/admin/stats"), api.get("/admin/merchants"), api.get("/admin/customers"), api.get("/admin/transactions")]);
      setStats(statsResponse.data.stats); setMerchants(merchantResponse.data.merchants); setCustomers(customerResponse.data.customers); setTransactions(txResponse.data.transactions);
    }
  }
  useEffect(() => { load().catch((e) => setNotice(e.response?.data?.message || "Could not load dashboard data.")); }, []);
  async function createCoupon(event) {
    event.preventDefault(); setNotice("");
    try {
      const { data } = await api.post("/coupons", { ...form, discountValue: Number(form.discountValue), maxRedemptions: 1, expiresAt: new Date(form.expiresAt).toISOString() });
      setNotice(`Coupon created for ${data.coupon.customer?.name || "customer"} · ${data.txHash}`);
      setForm({ ...form, name: "", description: "", customerId: "" });
      await showQr(data.coupon);
      await load();
    } catch (e) { setNotice(e.response?.data?.message || "Coupon creation failed."); }
  }
  async function showQr(coupon) {
    try { setQr({ coupon, dataUrl: await QRCode.toDataURL(coupon.couponId, { width: 280, margin: 2, color: { dark: "#111827", light: "#ffffff" } }) }); }
    catch (e) { setNotice(`QR generation failed: ${e.message}`); }
  }
  async function saveWallet() {
    try { const { data } = await api.put("/users/wallet", { walletAddress }); setWalletAddress(data.walletAddress); updateWalletAddress(data.walletAddress); setNotice("Wallet address saved."); }
    catch (e) { setNotice(e.response?.data?.message || "Could not save wallet."); }
  }
  async function authorize(merchantId) {
    try { const { data } = await api.post("/merchants/authorize", { merchantId }); setNotice(`${data.message} · ${data.txHash}`); }
    catch (e) { setNotice(e.response?.data?.message || "Merchant authorization failed."); }
  }

  const isAdmin = user.role === "admin";
  const isMerchant = user.role === "merchant";
  const activeCount = coupons.filter((c) => c.active && new Date(c.expiresAt) > new Date() && c.redemptionCount < c.maxRedemptions).length;
  const expiredCount = coupons.filter((c) => new Date(c.expiresAt) <= new Date()).length;
  const redeemedCount = coupons.filter((c) => c.redemptionCount > 0).length;
  return <SiteLayout><section className="dashboard container">
    <div className="dashboard-heading"><div><span className="eyebrow">{isAdmin ? "PLATFORM OVERVIEW" : isMerchant ? "MERCHANT WORKSPACE" : "YOUR COLLECTION"}</span><h1>Hello, {user.name.split(" ")[0]}<span className="heading-dot">.</span></h1><p>{isAdmin ? "Manage issuance, merchants, and on-chain activity." : isMerchant ? "Verify coupons and keep redemptions moving." : "Your verified deals, all in one place."}</p></div><span className="role-pill"><CircleUserRound size={15} /> {user.role}</span></div>
    {notice && <div className="notice">{notice}<button onClick={() => setNotice("")}>×</button></div>}
    <div className="stats-grid">{(isAdmin
      ? [["Coupons issued", stats.totalCoupons], ["Available", stats.active], ["Customers", stats.customers], ["Merchants", stats.merchants]]
      : isMerchant
        ? [["Assigned coupons", coupons.length], ["Available", activeCount], ["Successful redemptions", transactions.length], ["Expired", expiredCount]]
        : [["Total coupons", coupons.length], ["Active", activeCount], ["Redeemed", redeemedCount], ["Expired", expiredCount]]
    ).map(([label, number]) => <div className="stat-card" key={label}><span>{label}</span><b>{number ?? "—"}</b><small>{isMerchant && label === "Successful redemptions" ? "Confirmed on-chain" : "Recorded in the platform"}</small></div>)}</div>
    {isAdmin && <>
      <div className="dashboard-columns"><section className="panel"><div className="panel-title"><div><span className="eyebrow">ON-CHAIN ISSUE</span><h2>Create a coupon</h2></div><Blocks /></div><form className="coupon-form" onSubmit={createCoupon}>
        <label>Coupon name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Summer welcome offer" /></label>
        <label>Description<input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A short offer description" /></label>
        <div className="form-row"><label>Discount type<select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select></label><label>Value<input type="number" min="1" max={form.discountType === "percentage" ? 100 : undefined} required value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} /></label></div>
        <div className="form-row"><label>Expires on<input type="date" required min={new Date().toISOString().slice(0, 10)} value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} /></label><label>Redemption limit<input value="1 use per coupon" disabled /></label></div>
        <label>Assign to customer<select required value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}><option value="">Select a customer</option>{customers.map((customer) => <option value={customer._id} key={customer._id}>{customer.name} · {customer.email}</option>)}</select></label>
        <label>Assign merchant (optional)<select value={form.merchantId} onChange={(e) => setForm({ ...form, merchantId: e.target.value })}><option value="">Any authorized merchant</option>{merchants.map((m) => <option value={m._id} key={m._id}>{m.name}</option>)}</select></label>
        <button className="button form-submit">Register on Ethereum <ArrowUpRight size={16} /></button>
      </form></section><section className="panel"><div className="panel-title"><div><span className="eyebrow">MERCHANT ACCESS</span><h2>Merchant accounts</h2></div><CircleUserRound /></div>
        {merchants.length ? merchants.map((m) => <div className="merchant-row" key={m._id}><div className="merchant-avatar">{m.name[0]}</div><div><b>{m.name}</b><small>{m.email}</small><small>{m.walletAddress ? `${m.walletAddress.slice(0, 8)}…${m.walletAddress.slice(-5)}` : "Wallet not linked"}</small></div><button disabled={!m.walletAddress} className="button button-small" onClick={() => authorize(m._id)}>Authorize</button></div>) : <p className="empty-note">Merchant registrations will appear here.</p>}
      </section></div></>}
    {isAdmin && <section className="panel"><div className="panel-title"><div><span className="eyebrow">REGISTERED ACCOUNTS</span><h2>Customers</h2></div><CircleUserRound /></div>{customers.length ? customers.map((customer) => <div className="merchant-row" key={customer._id}><div className="merchant-avatar">{customer.name[0]}</div><div><b>{customer.name}</b><small>{customer.email}</small></div><span className={`status ${customer.active ? "status-active" : "status-used"}`}>{customer.active ? "Active" : "Disabled"}</span></div>) : <p className="empty-note">No customers registered yet.</p>}</section>}
    {isMerchant && <section className="panel wallet-panel"><div><span className="eyebrow">MERCHANT SETUP</span><h2>Link your Ethereum wallet</h2><p>Your wallet must be authorized by an admin before redemptions can be recorded on-chain.</p></div><div className="wallet-link"><input value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} placeholder="0x…" /><button className="button button-small button-ghost" onClick={async () => { if (!window.ethereum) return setNotice("Install MetaMask to connect your merchant wallet."); try { const [address] = await window.ethereum.request({ method: "eth_requestAccounts" }); setWalletAddress(address); } catch (e) { setNotice(e.message); } }}>Use MetaMask</button><button className="button button-small" onClick={saveWallet}>Save wallet</button></div></section>}
    <section className="panel coupon-panel"><div className="panel-title"><div><span className="eyebrow">{isMerchant ? "ASSIGNED OFFERS" : "YOUR COUPONS"}</span><h2>{isAdmin ? "Latest coupons" : isMerchant ? "Coupons to verify" : "Available to you"}</h2></div><span className="count-pill">{coupons.length} total</span></div>
      {coupons.length ?       <div className="coupon-list">{coupons.map((c) => {
        const expired = new Date(c.expiresAt) <= new Date();
        const redeemed = c.redemptionCount >= c.maxRedemptions;
        const status = redeemed ? "Redeemed" : expired ? "Expired" : c.active ? "Active" : "Inactive";
        return <article className="coupon-row" key={c._id}><div className="discount-tile"><b>{c.discountValue}{c.discountType === "percentage" ? "%" : ""}</b><small>{c.discountType === "percentage" ? "OFF" : "AMOUNT"}</small></div><div className="coupon-info"><h3>{c.name}</h3><p>{c.description || "Verified BlockVoucher offer"}</p><small>{c.couponId} · Expires {new Date(c.expiresAt).toLocaleDateString()}</small>{isAdmin && c.customer?.name && <small>Assigned to {c.customer.name}</small>}</div>{user.role === "customer" && qrImages[c._id] && <div className="coupon-qr"><img className="coupon-qr-preview" src={qrImages[c._id]} alt={`QR code for ${c.couponId}`} /><a className="button button-small button-ghost" download={`${c.couponId}.png`} href={qrImages[c._id]}>Save QR image</a></div>}<span className={`status ${redeemed ? "status-used" : "status-active"}`}>{status}</span>{isAdmin && <button className="button button-small button-ghost" onClick={() => showQr(c)}>View QR</button>}{isAdmin && c.active && <button className="button button-small button-danger" onClick={async () => { try { const { data } = await api.post(`/coupons/${c.couponId}/deactivate`); setNotice(`${data.message} · ${data.txHash}`); await load(); } catch (e) { setNotice(e.response?.data?.message || "Deactivation failed."); } }}>Deactivate</button>}</article>;
      })}</div> : <div className="empty-state"><div className="empty-icon"><Blocks /></div><h3>No coupons just yet</h3><p>Coupons issued by an administrator will show up here.</p></div>}
    </section>
    {isMerchant && <VerifyPanel onNotice={setNotice} onRedeemed={() => load()} />}
    {(isAdmin || isMerchant) && <section className="panel transaction-panel"><div className="panel-title"><div><span className="eyebrow">{isAdmin ? "PUBLICLY AUDITABLE" : "YOUR ON-CHAIN ACTIVITY"}</span><h2>{isAdmin ? "Recent transactions" : "Redemption history"}</h2></div><Blocks /></div>{transactions.length ? transactions.slice(0, 8).map((tx) => <div className="transaction-row" key={tx.txHash}><span className="tx-type">{tx.type}</span><b>{tx.couponId}</b><small>{tx.actor} · {new Date(tx.timestamp).toLocaleString()}</small><span className="tx-hash">{tx.txHash.slice(0, 8)}…</span></div>) : <p className="empty-note">No transactions recorded yet.</p>}</section>}
  </section>{qr && <div className="modal-backdrop" onClick={() => setQr(null)}><div className="qr-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setQr(null)}>×</button><span className="eyebrow">ON-CHAIN COUPON</span><h2>{qr.coupon.name}</h2><img src={qr.dataUrl} alt={`QR code for ${qr.coupon.couponId}`} /><b>{qr.coupon.couponId}</b><a className="button button-small" download={`${qr.coupon.couponId}.png`} href={qr.dataUrl}>Download QR</a><small>Scan with a merchant account to verify.</small></div></div>}</SiteLayout>;
}

function VerifyPanel({ onNotice, onRedeemed }) {
  const [couponId, setCouponId] = useState("");
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scanner = useRef(null);
  useEffect(() => {
    scanner.current = new Html5Qrcode("bv-qr-reader");
    return () => {
      if (scanner.current?.isScanning) scanner.current.stop().catch(() => {});
    };
  }, []);
  async function verify(id = couponId, { redeemIfValid = false } = {}) {
    try {
      const { data } = await api.post("/coupons/verify", { couponId: id });
      const alreadyRedeemed = data.alreadyRedeemed ||
        /already used|already redeemed|redemption limit reached/i.test(data.reason || "");
      setResult(alreadyRedeemed
        ? { ...data, valid: false, alreadyRedeemed: true, reason: "Voucher already redeemed." }
        : data);
      if (data.valid && redeemIfValid) await redeem(data.coupon);
      return data;
    } catch (e) {
      setResult({ valid: false, reason: e.response?.data?.message || "Verification failed." });
      return null;
    }
  }
  async function startScan() {
    try {
      await scanner.current.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 240, height: 240 } }, (text) => {
        setCouponId(text); scanner.current.stop().catch(() => {}); setScanning(false); verify(text);
      }, () => {});
      setScanning(true);
    } catch (e) { onNotice(`Could not start camera: ${e.message}`); }
  }
  async function stopScan() {
    if (scanner.current?.isScanning) await scanner.current.stop();
    setScanning(false);
  }
  async function redeem(coupon = result?.coupon) {
    try {
      if (!coupon) throw new Error("Verify a valid coupon first.");
      const { data } = await api.post("/coupons/redeem", { couponId: coupon.couponId });
      setResult({ valid: false, redeemed: true, reason: "Coupon redeemed successfully." });
      onNotice(`${data.message} · ${data.txHash}`);
      onRedeemed().catch((e) => onNotice(e.response?.data?.message || "Redemption succeeded, but transaction history could not be refreshed."));
    } catch (e) {
      const message = e.response?.data?.message || e.shortMessage || e.message || "Redemption failed.";
      const alreadyRedeemed = /already used|already redeemed|redemption limit reached/i.test(message);
      setResult({ valid: false, alreadyRedeemed, reason: alreadyRedeemed ? "Voucher already redeemed." : message });
    }
  }
  return <section className="panel verify-panel"><div className="panel-title"><div><span className="eyebrow">MERCHANT TOOLKIT</span><h2>Verify a coupon</h2><p className="verify-help">Uploading a valid QR verifies and redeems it on-chain. Used coupons are rejected.</p></div><ShieldCheck /></div><div id="bv-qr-reader" className="qr-reader" />
    <div className="scanner-actions"><button className="button button-small" onClick={scanning ? stopScan : startScan}>{scanning ? "Stop camera" : "Start camera scanner"}</button><label className="button button-small button-ghost upload-button">Upload QR image<input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { if (scanner.current?.isScanning) await scanner.current.stop(); setScanning(false); const text = await scanner.current.scanFile(file, true); setCouponId(text); await verify(text, { redeemIfValid: true }); } catch { setResult({ valid: false, reason: "Could not read a coupon QR code from that image." }); } finally { e.target.value = ""; } }} /></label></div>
    <div className="manual-verify"><input value={couponId} onChange={(e) => setCouponId(e.target.value)} placeholder="Enter coupon ID manually" /><button className="button button-small" onClick={() => verify()}>Verify</button></div>
    {result && <div className={`verification-result ${result.valid || result.redeemed ? "result-valid" : result.alreadyRedeemed ? "result-used" : "result-invalid"}`}><div className="result-symbol">{result.valid ? <ShieldCheck /> : result.redeemed ? "✓" : result.alreadyRedeemed ? "!" : "×"}</div><div><span className="eyebrow">{result.redeemed ? "COUPON REDEEMED" : result.valid ? "VALID COUPON" : result.alreadyRedeemed ? "VOUCHER ALREADY REDEEMED" : "INVALID COUPON"}</span><h3>{result.valid ? result.coupon.name : result.reason}</h3>{result.valid && <p>{result.coupon.discountValue}{result.coupon.discountType === "percentage" ? "%" : ""} off · Expires {new Date(result.coupon.expiresAt).toLocaleDateString()}</p>}</div>{result.valid && <button className="button button-small" onClick={() => redeem(result.coupon)}>Redeem coupon</button>}</div>}
  </section>;
}

function AppRoutes() {
  return <Routes><Route path="/" element={<Home />} /><Route path="/login" element={<AuthPage mode="login" />} /><Route path="/register" element={<AuthPage mode="register" />} /><Route path="/about" element={<AboutPage />} /><Route path="/contact" element={<ContactPage />} /><Route path="/dashboard" element={<Protected><Dashboard /></Protected>} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}

export default function App() { return <AuthProvider><AppRoutes /></AuthProvider>; }
