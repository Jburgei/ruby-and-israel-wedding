import React from "react";
import Reveal from "./shared/Reveal.jsx";
import Particles from "./shared/Particles.jsx"

// Swap this for whichever verse the couple wants.
const VERSE_TEXT =
  "Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It always protects, always trusts, always hopes, always perseveres.";
const VERSE_REF = "1 Corinthians 13:4, 7";

export default function Closing() {
  return (
    <section className="closing">
        <Particles />
      <Reveal>
        <p className="closing-verse">&ldquo;{VERSE_TEXT}&rdquo;</p>
        <p className="closing-ref">{VERSE_REF}</p>
      </Reveal>
    </section>
  );
}
