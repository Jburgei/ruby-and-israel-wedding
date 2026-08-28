import React from "react";
import { Phone, MessageCircle } from "lucide-react";
import Reveal from "./shared/Reveal.jsx";

// Update names and numbers once confirmed.
const CONTACTS = [
  { name: "Contact One", phone: "+254 7XX XXX XXX" },
  { name: "Contact Two", phone: "+254 7XX XXX XXX" },
];

function toWhatsAppLink(phone) {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

export default function Gift() {
  return (
    <section className="gift" id="gift">
      <Reveal>
        <p className="eyebrow">Gifts</p>
        <h2>Your presence is the greatest gift</h2>
        <p className="gift-sub">
          Should you wish to bless us further, we prefer enveloped gifts. For
          any inquiries, kindly reach out to our contacts below.
        </p>

        <div className="gift-contacts">
          {CONTACTS.map((c) => (
            <div className="gift-contact" key={c.name}>
              <span className="gift-contact-name">{c.name}</span>
              <span className="gift-contact-phone">{c.phone}</span>
              <div className="gift-contact-actions">
                <a className="btn-outline" href={`tel:${c.phone.replace(/\s/g, "")}`}>
                  <Phone size={14} /> Call
                </a>
                <a
                  className="btn-outline gift-whatsapp"
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
    </section>
  );
}
