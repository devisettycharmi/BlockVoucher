import { useState } from "react";

export default function useWallet() {
  const [address, setAddress] = useState("");

  async function connect() {
    if (!window.ethereum) throw new Error("Install MetaMask to connect a wallet.");
    const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!account) throw new Error("No wallet account was selected.");
    setAddress(account);
    return account;
  }

  return { address, connect };
}
