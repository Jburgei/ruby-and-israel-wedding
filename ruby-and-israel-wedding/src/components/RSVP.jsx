import React, { useCallback, useState } from "react";
import { Calendar } from "lucide-react";
import Reveal from "./shared/Reveal.jsx";

function submitRsvp(payload) {
  // a real endpoint 
  return new Promise((resolve) => setTimeout(() => resolve(payload), 500));
}

export default function RSVP() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState(null);
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
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;

      setSubmitting(true);
      try {
        // TODO: replace with a real endpoint (Formspree, Getform, a small
        // backend route, etc). This currently just simulates a network call
        // so the form's states can be tested end to end.
        await submitRsvp({ name: name.trim(), phone: phone.trim(), attending });
        setSubmitted(true);
      } catch (err) {
        setErrors({ form: "Something went wrong, please try again." });
      } finally {
        setSubmitting(false);
      }
    },
    [name, phone, attending]
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
                  ? "We can't wait to celebrate with you on December 4th."
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
              {errors.form && <div className="field-error">{errors.form}</div>}
              <button className="submit-btn" type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Confirm my RSVP"}
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}
