import React from "react";
import { MapPin, Navigation, Phone, MessageCircle } from "lucide-react";
import Reveal from "./shared/Reveal.jsx";

const VENUE_NAME = "CITAM Karen";
const VENUE_ADDRESS = "CITAM Karen, Langata Road, Nairobi, Kenya";
const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  VENUE_ADDRESS
)}`;

// Update names and numbers once confirmed.
const CONTACTS = [
  { name: "Caroline", phone: "+254 723393509" },
  { name: "Samson", phone: "+254 721662045" },
];

function toWhatsAppLink(phone) {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
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
            Should you wish to bless us further, we prefer enveloped gifts.
            For any inquiries, kindly reach out below.
          </p>
          <div className="tg-gift-contacts">
            {CONTACTS.map((c) => (
              <div className="tg-contact" key={c.name}>
                <span className="tg-contact-name">{c.name}</span>
                <span className="tg-contact-phone">{c.phone}</span>
                <div className="tg-contact-actions">
                  <a className="btn-light" href={`tel:${c.phone.replace(/\s/g, "")}`}>
                    <Phone size={14} /> Call
                  </a>
                  <a
                    className="btn-light"
                    href={toWhatsAppLink(c.phone)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
