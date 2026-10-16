import React, { useState } from "react";
import { MapPin, Navigation, Copy, Check } from "lucide-react";
import Reveal from "./shared/Reveal.jsx";

const VENUE_NAME = "CITAM Karen";
const VENUE_ADDRESS = "CITAM Karen, Langata Road, Nairobi, Kenya";
const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  VENUE_ADDRESS
)}`;

const PAYBILL_NUMBER = "4816627";

function CopyChip({ label, value }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be unavailable — fail quietly.
    }
  }

  return (
    <button type="button" className="tg-copy-chip" onClick={handleCopy}>
      <span className="tg-copy-chip-label">{label}</span>
      <span className="tg-copy-chip-value">{value}</span>
      <span className="tg-copy-chip-icon">
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </span>
    </button>
  );
}

export default function TravelGift() {
  return (
    <section className="travel-gift">
      <video
        className="tg-video"
        src="/videos/Getting there_1.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="tg-scrim" />

      <div className="tg-grid">
        <Reveal className="tg-col tg-col-travel" id="getting-there">
          <p className="eyebrow">Travel</p>
          <h2>Getting there</h2>
          <MapPin className="ic" size={20} strokeWidth={1.3} />
          <span className="venue-name">{VENUE_NAME}</span>
          <span className="venue-address">{VENUE_ADDRESS}</span>
          <a
            className="btn-gold"
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Navigation size={14} /> Get Directions
          </a>
        </Reveal>

        <Reveal className="tg-col tg-col-gift" id="gift">
          <p className="eyebrow">Gift</p>
          <h2>Your presence is the greatest gift</h2>
          <p className="tg-gift-sub">
            Should you wish to bless us with a gift, we would gratefully
            prefer cash gifts via M-Pesa.
          </p>
          <div className="tg-gift-paybill">
            <CopyChip label="Paybill" value={PAYBILL_NUMBER} />
            <p className="tg-gift-account-note">
              Account Number: your name
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
