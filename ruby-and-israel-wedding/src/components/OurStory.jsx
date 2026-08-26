import React from "react";
import Reveal from "./shared/Reveal.jsx";

export default function OurStory() {
  return (
    <section className="story">
      <Reveal className="story-text">
        <div>
          <p className="eyebrow">Our story</p>
        </div>
        <p>
          It all began in the hallways of high school &mdash; two teenagers
          who had no idea that a simple friendship would grow into forever.
          Through the years, that bond only deepened, watching life&rsquo;s
          changes and growing stronger with every chapter. Today, we&rsquo;re
          excited to begin the next journey together, as husband and wife.
        </p>
      </Reveal>
      <div className="story-photo">
        <img
          src="/images/Our_story.jpg"
          alt="Ruby and Israel"
          className="story-img"
        />
      </div>
    </section>
  );
}