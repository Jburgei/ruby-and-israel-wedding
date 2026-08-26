import React from "react";
import Hero from "./components/Hero.jsx";
import SaveTheDate from "./components/SaveTheDate.jsx";
import OurStory from "./components/OurStory.jsx";
import LetsCelebrate from "./components/LetsCelebrate.jsx";
import RSVP from "./components/RSVP.jsx";

export default function App() {
  return (
    <div className="wed-app">
      <Hero />
      <SaveTheDate />
      <OurStory />
      <LetsCelebrate />
      <RSVP />
    </div>
  );
}
