import React from "react";
import Reveal from "./shared/Reveal.jsx";
import Countdown from "./shared/Countdown.jsx";

export default function SaveTheDate() {
  return (
    <section className="std">
      <Reveal>
        <p className="eyebrow">Save the date</p>
        <div className="date-weekday">Saturday</div>
        <div className="date-words">The Fourth of December</div>
        <div className="date-year">2026</div>
        <div className="std-divider" />
        <p>
          We would be delighted to share this wonderful celebration with you
          on our wedding day.
        </p>
        <Countdown />
      </Reveal>
    </section>
  );
}
