import React, { useState } from "react";
import EnvelopeIntro from "./components/EnvelopeIntro.jsx";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import SaveTheDate from "./components/SaveTheDate.jsx";
import OurStory from "./components/OurStory.jsx";
import LetsCelebrate from "./components/LetsCelebrate.jsx";
import GettingThere from "./components/GettingThere.jsx";
import Gift from "./components/Gift.jsx";
import Gallery from "./components/Gallery.jsx";
import RSVP from "./components/RSVP.jsx";
import Closing from "./components/Closing.jsx";


export default function App() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <div className="wed-app">
      {!introDone && <EnvelopeIntro onDone={() => setIntroDone(true)} />}
      <Nav />
      <Hero />
      <SaveTheDate />
      <OurStory />
      <LetsCelebrate />
      <GettingThere />
      <Gift />
      <Gallery />
      <RSVP />
      <Closing />
    </div>
  );
}