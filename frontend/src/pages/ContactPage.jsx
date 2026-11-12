import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import SiteLayout from "../layouts/SiteLayout";
import api from "../services/api";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    const formData = new FormData(event.currentTarget);
    try { await api.post("/contact", Object.fromEntries(formData.entries())); setSent(true); }
    catch (e) { setError(e.response?.data?.message || "Could not send your message."); }
    finally { setBusy(false); }
  }

  return <SiteLayout><section className="auth-page container"><div className="auth-card"><span className="eyebrow">GET IN TOUCH</span><h1>Say hello.</h1><p>Questions about the project? Drop us a note.</p>{sent ? <div className="notice">Thanks for reaching out. Your message has been received.</div> : <form onSubmit={submit}><label>Name<input name="name" required maxLength={100} placeholder="Your name" /></label><label>Email<input name="email" required type="email" maxLength={254} placeholder="you@example.com" /></label><label>Message<textarea name="message" required maxLength={5000} rows="5" placeholder="How can we help?" /></label>{error && <div className="form-error">{error}</div>}<button disabled={busy} className="button form-submit">{busy ? "Sending…" : "Send message"} <ArrowUpRight size={16} /></button></form>}</div></section></SiteLayout>;
}
