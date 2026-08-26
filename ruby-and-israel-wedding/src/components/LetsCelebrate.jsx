import React from "react";
import { Calendar, MapPin, Clock } from "lucide-react";
import Reveal from "./shared/Reveal.jsx";

export default function LetsCelebrate() {
  return (
    <section className="join">
      <Reveal>
        <p className="eyebrow">Join us</p>
        <h2>Let&rsquo;s celebrate</h2>
        <div className="join-grid">
          <div className="join-item">
            <Calendar className="ic" size={26} strokeWidth={1.2} />
            <span className="lbl">Date</span>
            <span className="val">December 4th, 2026</span>
          </div>
          <span className="join-div" />
          <div className="join-item">
            <MapPin className="ic" size={26} strokeWidth={1.2} />
            <span className="lbl">Venue</span>
            <span className="val">Details to follow</span>
          </div>
          <span className="join-div" />
          <div className="join-item">
            <Clock className="ic" size={26} strokeWidth={1.2} />
            <span className="lbl">Time</span>
            <span className="val">11:00 AM</span>
          </div>
        </div>
        <div className="join-actions">
          <button className="btn-gold" type="button">
            View full invite
          </button>
          <button className="btn-outline" type="button">
            <MapPin size={14} /> Get directions
          </button>
        </div>
      </Reveal>
    </section>
  );
}
