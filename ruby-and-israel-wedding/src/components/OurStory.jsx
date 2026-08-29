import React from "react";
import Reveal from "./shared/Reveal.jsx";
import Particles from "./shared/Particles.jsx";

export default function OurStory() {
  return (
    <section className="story" id="story">
      <img className="story-bg" src="/images/Our_story.jpg" alt="Ruby and Israel" />
      <div className="story-scrim" />
      <Particles count={16} />

      <Reveal className="story-card">
        <span className="story-watermark" aria-hidden="true">
          &amp;
        </span>
        <div className="story-card-content">
          <p className="eyebrow">Our story</p>
          <p className="story-body">
            It all began in the hallways of high school &mdash; two teenagers
            who had no idea that a simple friendship would grow into forever.
            Through the years, that bond only deepened, watching life&rsquo;s
            changes and growing stronger with every chapter. Today, we&rsquo;re
            excited to begin the next journey together, as husband and wife.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
