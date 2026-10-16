import React, { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Camera } from "lucide-react";
import { db, ensureSignedIn } from "../../firebase";
import { setCachedProfile } from "../../lib/guestProfile";

export default function ProfileSetupModal({ onDone }) {
  const [returning, setReturning] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // Tries the wide crop first (best fit for this short, full-width strip),
  // then falls back through the other sizes of the same photo, and finally
  // to the placeholder if none of them exist at these paths.
  const heroCandidates = [
    "/images/Gallery_12_wide.jpg",
    "/images/Gallery_12_couple.jpg",
    "/images/Gallery_12.jpeg",
  ];
  const [heroIndex, setHeroIndex] = useState(0);
  const heroFailed = heroIndex >= heroCandidates.length;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Please enter your name and phone number.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const user = await ensureSignedIn();
      const profile = { name: name.trim(), phone: phone.trim() };

      await setDoc(
        doc(db, "guestProfiles", user.uid),
        { ...profile, createdAt: serverTimestamp() },
        { merge: true }
      );

      setCachedProfile(profile);
      onDone(profile);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pw-welcome-page">
      <div className="pw-welcome-hero">
        {!heroFailed && (
          <img
            src={heroCandidates[heroIndex]}
            alt="Ruby and Israel"
            onError={() => setHeroIndex((i) => i + 1)}
          />
        )}
        {heroFailed && (
          <div className="pw-welcome-hero-placeholder">
            <Camera size={34} />
            <span>Photo of Ruby and Israel</span>
          </div>
        )}
      </div>

      <div className="pw-welcome-card">
        <div className="pw-modal-monogram">I&nbsp;|&nbsp;R</div>
        <h2>Karibu to Ruby &amp; Israel's wedding.</h2>
        <p className="pw-modal-sub">
          Share your photos and blessings with the couple.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="pw-field">
            <label>Your full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Faith Wanjiru"
            />
          </div>

          <div className="pw-field">
            <label>Your phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XX XXX XXX"
            />
          </div>

          {error && <p className="pw-error">{error}</p>}

          <div className="pw-modal-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Joining..." : "Join the celebration"}
            </button>
          </div>
        </form>

        <button
          type="button"
          className="pw-welcome-link"
          onClick={() => setReturning((v) => !v)}
        >
          I've been here before
        </button>
        {returning && (
          <p className="pw-modal-sub" style={{ marginTop: 10 }}>
            No problem — just enter your name and phone number again above
            and tap the button to continue.
          </p>
        )}

        <p className="pw-welcome-footer">Friday, 4 December 2026 &middot; CITAM Karen</p>
      </div>
    </div>
  );
}
