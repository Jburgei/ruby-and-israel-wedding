import React, { useState, useCallback } from "react";

export default function EnvelopeIntro({ onDone }) {
  const [opening, setOpening] = useState(false);
  const [hidden, setHidden] = useState(false);

  const handleOpen = useCallback(() => {
    if (opening) return;
    setOpening(true);
    window.setTimeout(() => {
      setHidden(true);
      if (onDone) onDone();
    }, 2700);
  }, [opening, onDone]);

  if (hidden) return null;

  return (
    <button
      type="button"
      className={`intro-overlay ${opening ? "opening" : ""}`}
      onClick={handleOpen}
      aria-label="Enter the site"
    >
      <div className="intro-photo" />
      <div className="intro-scrim" />
      <div className="intro-content">
        <span className="intro-monogram">
          R<span className="hero-amp">&amp;</span>I
        </span>
        <span className="intro-date">December 4th, 2026</span>
        <span className="intro-hint">Tap to begin</span>
      </div>
    </button>
  );
}
