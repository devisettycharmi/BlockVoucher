import React, { useState } from "react";
import { ArrowUpRight, Menu, Wallet, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useWallet from "../hooks/useWallet";
import Brand from "../components/Brand";

export default function SiteLayout({ children }) {
  const { user, logout } = useAuth();
  const [menu, setMenu] = useState(false);
  const { address, connect } = useWallet();
  const navigate = useNavigate();

  async function connectWallet() {
    try { await connect(); }
    catch (error) { alert(error.message); }
  }

  return <div className="app-shell">
    <header className="topbar"><div className="nav-wrap"><Brand />
      <button className="mobile-menu" onClick={() => setMenu(!menu)} aria-label="Toggle navigation">{menu ? <X /> : <Menu />}</button>
      <nav className={menu ? "nav-links open" : "nav-links"}>
        <Link to="/about">About</Link><Link to="/contact">Contact</Link>
        {user ? <><Link to="/dashboard">Dashboard</Link><button className="text-button" onClick={() => { logout(); navigate("/"); }}>Log out</button></> : <><Link to="/login">Log in</Link><Link className="button button-small" to="/register">Get started <ArrowUpRight size={15} /></Link></>}
        {user && <button className="wallet-button" onClick={connectWallet}><Wallet size={15} />{address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Connect wallet"}</button>}
      </nav></div></header>
    <main>{children}</main>
    <footer><div className="footer-inner"><Brand /><p>Secure your coupons. Verify with blockchain.</p><span>© {new Date().getFullYear()} BlockVoucher · Built for transparent commerce</span></div></footer>
  </div>;
}
