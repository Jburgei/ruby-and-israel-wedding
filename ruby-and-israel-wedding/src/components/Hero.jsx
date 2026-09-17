import React from "react";
import { ChevronDown } from "lucide-react";


export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-photo" />
      <div className="hero-rings" />
      <div className="hero-top">
        <div className="hero-invite">
          <p className="eyebrow">We are thrilled to invite you to the wedding of</p>
        </div>
        <div className="hero-names">
          <div className="names">
            <span className="name-line">Ruby Bukachi</span>
            <span className="hero-amp">&amp;</span>
            <span className="name-line">Israel Burgei</span>
          </div>
        </div>
      </div>
      <div className="hero-bottom">
        <div className="hero-date">
          Taking place on the day of <b>December 4th, 2026</b>
        </div>
        <div className="scroll-cue">
          <span>Scroll</span>
          <ChevronDown size={16} />
        </div>
      </div>
    </section>
  );
}