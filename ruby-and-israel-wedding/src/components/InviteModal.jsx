import React, { useEffect } from "react";
import { X, Download } from "lucide-react";

export default function InviteModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="invite-modal-backdrop" onClick={onClose}>
      <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
        <button className="invite-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="invite-card">
          <p className="invite-eyebrow">We </p>
          <div className="invite-names">
            Peace Ruby Wangare Bukachi
            <span className="invite-amp">&amp;</span>
            Israel Michael Kipkemei Burgei
          </div>
          <div className="invite-divider" />
          <p className="invite-eyebrow">Together with our Parents</p>
          <p className="invite-message">
            Rev. Grace N. Bukachi &amp; James Bukachi
          </p>
          <p className="invite-message">and</p>
          <p className="invite-message">
            Caroline Burgei &amp; Samson Burgei
          </p>
          <div className="invite-divider" /> 
          <div className="invite-message">
            Warmly invite you to our
            </div>
          <p className="invite-eyebrow">Wedding Ceremony</p>
          <p className="invite-detail-strong">Friday, 4th December 2026</p>
          <p className="invite-detail">12:00 PM</p>
          <p className="invite-detail-strong">CITAM Karen</p>
          <p className="invite-detail">Langata Road, Nairobi, Kenya</p>
        </div>

        <a
          className="btn-gold invite-download"
          href="/Ruby_and_Israel_Invitation.pdf"
          download="Ruby-and-Israel-Invitation.pdf"
        >
          <Download size={14} /> Download Invitation
        </a>
      </div>
    </div>
  );
}