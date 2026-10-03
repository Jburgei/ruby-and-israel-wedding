import React, { useState, useCallback } from "react";

export default function EnvelopeIntro({ onDone, onOpen }) {
  const [opening, setOpening] = useState(false);
  const [hidden, setHidden] = useState(false);

  const handleOpen = useCallback(() => {
    if (opening) return;
    setOpening(true);
    if (onOpen) onOpen();
    window.setTimeout(() => {
      setHidden(true);
      if (onDone) onDone();
    }, 2700);
  }, [opening, onDone, onOpen]);

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
        <span className="intro-eyebrow">The Wedding Of</span>
        <span className="intro-monogram">
          <span className="intro-name-line">Ruby Bukachi</span>
          <span className="intro-amp">&amp;</span>
          <span className="intro-name-line">Israel Burgei</span>
        </span>
        <span className="intro-date">December 4th, 2026</span>
        <span className="intro-hint">Tap to begin</span>
      </div>
    </button>
  );
}