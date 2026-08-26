import React from "react";
import { Camera } from "lucide-react";

export default function PhotoFrame({ label, aspect = "4 / 5", height }) {
  return (
    <div className="frame" style={height ? { height } : { aspectRatio: aspect }}>
      <div className="frame-inner">
        <Camera size={26} strokeWidth={1.1} />
        <span>{label}</span>
      </div>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
    </div>
  );
}
