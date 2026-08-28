import React from "react";
import { MapPin, Navigation } from "lucide-react";
import Reveal from "./shared/Reveal.jsx";

// Update this once the venue is confirmed — it drives both map links below.
const VENUE_NAME = "Citam Karen";
const VENUE_ADDRESS = " Citam Karen,Langata Road, Nairobi, Kenya"; 

const googleMapsUrl = VENUE_ADDRESS
  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(VENUE_ADDRESS)}`
  : null;

export default function GettingThere() {
  return (
    <section className="getting-there" id="getting-there">
      <Reveal>
        <p className="eyebrow">Travel</p>
        <h2>Getting there</h2>

        <div className="venue-card">
          <MapPin className="ic" size={22} strokeWidth={1.3} />
          <span className="venue-name">{VENUE_NAME}</span>
          {VENUE_ADDRESS && <span className="venue-address">{VENUE_ADDRESS}</span>}

          <div className="venue-actions">
            <a
              className="btn-outline"
              href={googleMapsUrl || "#"}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!googleMapsUrl}
            >
              <Navigation size={14} /> Get directions
            </a>
           
          </div>
        </div>
      </Reveal>
    </section>
  );
}
