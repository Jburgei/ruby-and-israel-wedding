import React, { useState } from 'react';
import EnvelopeIntro from './components/EnvelopeIntro';
import Hero from './components/Hero';
import SaveTheDate from './components/SaveTheDate';
import OurStory from './components/OurStory';
import LetsCelebrate from './components/LetsCelebrate';
import RSVP from './components/RSVP';


export default function App() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <div className="wed-app">
      {!introDone && <EnvelopeIntro onDone={() => setIntroDone(true)} />}
        <Hero />
        <SaveTheDate />
        <OurStory />
        <LetsCelebrate />
        <RSVP />
    </div>
  );
}