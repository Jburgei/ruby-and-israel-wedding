import React from "react";
import Reveal from "./shared/Reveal.jsx";

const PALETTE = [
  { name: "Navy", hex: "#16233f" },
  { name: "Burgundy", hex: "#5e1b30" },
  { name: "Gold", hex: "#e3b23e" },
  { name: "Coral", hex: "#ee8f6e" },
  { name: "Blush", hex: "#e8a6b8" },
  { name: "Dusty Blue", hex: "#7e93b0" },
];

export default function Colors() {
  return (
    <section className="colors" id="colors">
      <Reveal>
        <p className="eyebrow">Dress code</p>
        <h2>Our Pallete</h2>
        <p className="colors-sub">
          We&rsquo;d love to see these tones on you come December 4th.
        </p>
        <div className="colors-row">
          {PALETTE.map((c) => (
            <div className="colors-swatch" key={c.hex}>
              <span className="colors-dot" style={{ background: c.hex }} />
              <span className="colors-label">{c.name}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}