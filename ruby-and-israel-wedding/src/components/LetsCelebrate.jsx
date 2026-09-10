import React, { useState } from "react";
import { Calendar, MapPin, Clock } from "lucide-react";
import Reveal from "./shared/Reveal.jsx";
import InviteModal from "./InviteModal.jsx";

export default function LetsCelebrate() {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <section className="join" id="details">
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
            <span className="val">CITAM Karen</span>
          </div>
          <span className="join-div" />
          <div className="join-item">
            <Clock className="ic" size={26} strokeWidth={1.2} />
            <span className="lbl">Time</span>
            <span className="val">12:00 PM</span>
          </div>
        </div>
        <div className="join-actions">
          <button className="btn-gold" type="button" onClick={() => setShowInvite(true)}>
            View full invite
          </button>
        </div>
      </Reveal>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </section>
  );
}
