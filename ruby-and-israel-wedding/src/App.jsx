import React, { useState, useRef } from "react";
import EnvelopeIntro from "./components/EnvelopeIntro.jsx";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import SaveTheDate from "./components/SaveTheDate.jsx";
import OurStory from "./components/OurStory.jsx";
import LetsCelebrate from "./components/LetsCelebrate.jsx";
import Colors from "./components/Colors.jsx";
import TravelGift from "./components/TravelGift.jsx";
import Gallery from "./components/Gallery.jsx";
import RSVP from "./components/RSVP.jsx";
import Closing from "./components/Closing.jsx";
import MusicToggle from "./components/MusicToggle.jsx";

export default function App() {
  const [introDone, setIntroDone] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  const startMusic = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicPlaying) {
      audioRef.current.pause();
      setMusicPlaying(false);
    } else {
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  };

  return (
    <div className="wed-app">
      <audio ref={audioRef} src="/audio/song.mp3" loop />
      {!introDone && (
        <EnvelopeIntro onOpen={startMusic} onDone={() => setIntroDone(true)} />
      )}
      {introDone && <MusicToggle playing={musicPlaying} onToggle={toggleMusic} />}
      <Nav />
      <Hero />
      <SaveTheDate />
      <OurStory />
      <LetsCelebrate />
      <Colors />
      <TravelGift />
      <Gallery />
      <RSVP />
      <Closing />
    </div>
  );
}