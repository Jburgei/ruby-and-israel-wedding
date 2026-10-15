import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, ensureSignedIn } from "../../firebase";
import {
  saveGuestProfile,
  getRecentProfiles,
  forgetRecentProfile,
} from "../../lib/guestProfile";

export default function ProfileSetupModal({ onDone }) {
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState(() => getRecentProfiles());

  function handleContinueAs(profile) {
    saveGuestProfile({
      name: profile.name,
      avatarUrl: profile.avatarUrl || "",
      anonymous: false,
    });
    onDone();
  }

  function handleForget(e, profileName) {
    e.stopPropagation();
    forgetRecentProfile(profileName);
    setRecent(getRecentProfiles());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!anonymous && !name.trim()) {
      setError("Please enter a name, or choose to post anonymously.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const user = await ensureSignedIn();
      let avatarUrl = "";

      if (!anonymous && avatarFile) {
        const path = `avatars/${user.uid}-${Date.now()}-${avatarFile.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, avatarFile);
        avatarUrl = await getDownloadURL(storageRef);
      }

      saveGuestProfile({
        name: anonymous ? "" : name.trim(),
        avatarUrl,
        anonymous,
      });

      onDone();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pw-modal-backdrop">
      <div className="pw-modal">
        <h2>Welcome to the Photo Wall</h2>
        <p className="pw-modal-sub">
          Set up how you'll appear when you post photos or comments.
        </p>

        {recent.length > 0 && (
          <div className="pw-recent-guests">
            <p className="pw-recent-guests-label">Continue as</p>
            <div className="pw-recent-guests-list">
              {recent.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  className="pw-recent-guest-chip"
                  onClick={() => handleContinueAs(p)}
                >
                  {p.avatarUrl ? (
                    <img src={p.avatarUrl} alt="" />
                  ) : (
                    <span className="pw-recent-guest-fallback">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="pw-recent-guest-name">{p.name}</span>
                  <span
                    className="pw-recent-guest-remove"
                    onClick={(e) => handleForget(e, p.name)}
                    role="button"
                    aria-label={`Forget ${p.name}`}
                  >
                    &times;
                  </span>
                </button>
              ))}
            </div>
            <p className="pw-recent-guests-or">or set up someone new</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="pw-checkbox">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            Post Anonymously
          </label>

          {!anonymous && (
            <>
              <div className="pw-field">
                <label>Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Faith Wanjiru"
                />
              </div>

              <div className="pw-field">
                <label>Profile photo (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
              </div>
            </>
          )}

          {error && <p className="pw-error">{error}</p>}

          <div className="pw-modal-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
