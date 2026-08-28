import React from "react";
import { ChevronDown } from "lucide-react";
import Particles from "./shared/Particles.jsx"

export default function Hero() {
  return (
    <section
      className="hero"
      style={{
        backgroundImage:
          "linear-gradient(155deg, rgba(16,27,50,.6), rgba(42,63,104,.4)), url(/images/Hero_1.PNG)",
        backgroundSize: "cover",
        backgroundPosition: "50% 25%",
      }}
    >
      <div className="hero-rings" />
      <Particles />
      <div className="hero-top">
        <div className="hero-invite">
          <p className="eyebrow">We are thrilled to invite you to the wedding of</p>
          <p>Two stories becoming one, held in the presence of family and friends.</p>
        </div>
        <div className="hero-names">
          <div className="names">
            Ruby<span className="hero-amp">&amp;</span>Israel
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