import React from "react";
import Reveal from "./shared/Reveal.jsx";
import Pattern from "./shared/Pattern.jsx";
import Countdown from "./shared/Countdown.jsx";

export default function SaveTheDate() {
  return (
    <section className="std">
      <Reveal>
        <p className="eyebrow">Save the date</p>
        <div className="date">04 &middot; 12 &middot; 26</div>
        <Pattern color="var(--maroon)" />
        <Countdown date="2026-04-12" />
        <p>
          We would be delighted to share this wonderful celebration with you
          on our wedding day.
        </p>
      </Reveal>
    </section>
  );
}
