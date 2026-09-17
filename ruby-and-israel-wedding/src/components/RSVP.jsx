import React, { useCallback, useState } from "react";
import { Calendar, Loader2 } from "lucide-react";
import Reveal from "./shared/Reveal.jsx";


const SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwFUX1I2sPAsRqFJfwRfASw-BpRuJHnFFHFGBalrwm3GDX7At9zmCXfWIqvCxn-NPAJwg/exec";

export default function RSVP() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState(null);
  const [guests, setGuests] = useState("1");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const nextErrors = {};
      if (!name.trim()) nextErrors.name = "Enter your full name";
      if (!phone.trim()) nextErrors.phone = "Enter a phone number";
      if (!attending) nextErrors.attending = "Let us know if you can make it";
      if (attending === "yes" && (!guests || Number(guests) < 1)) {
        nextErrors.guests = "Let us know how many you're bringing";
      }
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;

      setSubmitting(true);

      // We can't read the response anyway (no-cors is opaque), so there's no
      // benefit to blocking the UI on the full round-trip to Apps Script —
      // fire it off in the background and let the user move on right away.
      fetch(SHEET_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          attending: attending === "yes" ? "Yes, attending" : "No, can't make it",
          guests: attending === "yes" ? Number(guests) : 0,
        }),
      }).catch(() => {});

      // Small fixed delay so the tap still feels like it did something,
      // instead of the button just instantly flashing to "done."
      await new Promise((resolve) => setTimeout(resolve, 450));

      setSubmitting(false);
      setSubmitted(true);
    },
    [name, phone, attending, guests]
  );

  return (
    <section className="rsvp" id="rsvp">
      <Reveal>
        <p className="eyebrow">Your presence matters</p>
        <h2>Kindly RSVP</h2>
        <p className="sub">
          Kindly fill in your details below to let us know if you&rsquo;ll be
          attending.
        </p>
        <div className="rsvp-card">
          {submitted ? (
            <div className="thanks">
              <Calendar className="ic" size={30} strokeWidth={1.1} />
              <h3>Thank you, {name.split(" ")[0]}</h3>
              <p>
                {attending === "yes"
                  ? Number(guests) > 1
                    ? `We can't wait to celebrate with you and your ${Number(guests) - 1} guest${Number(guests) - 1 > 1 ? "s" : ""} on December 4th.`
                    : "We can't wait to celebrate with you on December 4th."
                  : "We'll miss you, but thank you for letting us know."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="rsvp-name">Full name</label>
                <input
                  id="rsvp-name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <div className="field-error">{errors.name}</div>}
              </div>
              <div className="field">
                <label htmlFor="rsvp-phone">Number</label>
                <input
                  id="rsvp-phone"
                  type="tel"
                  placeholder="0712 345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {errors.phone && <div className="field-error">{errors.phone}</div>}
              </div>
              <div className="field">
                <label>Will you attend?</label>
                <div className="attend-row">
                  <button
                    type="button"
                    className={`attend-btn ${attending === "yes" ? "active-yes" : ""}`}
                    onClick={() => setAttending("yes")}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`attend-btn ${attending === "no" ? "active-no" : ""}`}
                    onClick={() => setAttending("no")}
                  >
                    No
                  </button>
                </div>
                {errors.attending && (
                  <div className="field-error">{errors.attending}</div>
                )}
              </div>
              {attending === "yes" && (
                <div className="field">
                  <label htmlFor="rsvp-guests">
                    How many will you be bringing? (including you)
                  </label>
                  <input
                    id="rsvp-guests"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="15"
                    value={guests}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setGuests(e.target.value)}
                  />
                  {errors.guests && (
                    <div className="field-error">{errors.guests}</div>
                  )}
                </div>
              )}
              {errors.form && <div className="field-error">{errors.form}</div>}
              <button className="submit-btn" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="spin" size={15} /> Sending
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}
