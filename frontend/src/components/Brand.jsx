import React from "react";
import { Link } from "react-router-dom";
import brandMark from "../assets/brand-mark.svg";

export default function Brand() {
  return <Link className="brand" to="/"><span className="brand-mark"><img src={brandMark} alt="" /></span>Block<span>Voucher</span></Link>;
}
