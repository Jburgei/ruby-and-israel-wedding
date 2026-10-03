import React from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function MusicToggle({ playing, onToggle }) {
  return (
    <button
      type="button"
      className="music-toggle"
      onClick={onToggle}
      aria-label={playing ? "Mute music" : "Play music"}
    >
      {playing ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  );
}