import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { storage, db, registerGuest, loginGuest } from "../../firebase";
import {
  setCachedProfile,
  getLastGuestName,
  setLastGuestName,
} from "../../lib/guestProfile";

function friendlyError(mode, err) {
  const code = err?.code || "";
  if (mode === "register") {
    if (code === "auth/email-already-in-use") {
      return "That name is already registered — try logging in instead, or use a slightly different name.";
    }
    if (code === "auth/weak-password") {
      return "Password should be at least 6 characters.";
    }
  } else {
    if (
      code === "auth/invalid-credential" ||
      code === "auth/wrong-password" ||
      code === "auth/user-not-found"
    ) {
      return "That name and password don't match. Double-check them, or register as a new guest.";
    }
  }
  return "Something went wrong. Please try again.";
}

export default function ProfileSetupModal({ onDone }) {
  const [mode, setMode] = useState("register"); // "register" | "login"
  const [name, setName] = useState(getLastGuestName());
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function switchMode(next) {
    setMode(next);
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const user = await registerGuest(name.trim(), password);

      let avatarUrl = "";
      if (avatarFile) {
        const path = `avatars/${user.uid}-${Date.now()}-${avatarFile.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, avatarFile);
        avatarUrl = await getDownloadURL(storageRef);
      }

      const profile = { name: name.trim(), avatarUrl };
      await setDoc(doc(db, "guestProfiles", user.uid), {
        ...profile,
        createdAt: serverTimestamp(),
      });

      setCachedProfile(profile);
      setLastGuestName(profile.name);
      onDone(profile);
    } catch (err) {
      console.error(err);
      setError(friendlyError("register", err));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!name.trim() || !password) {
      setError("Please enter your name and password.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const user = await loginGuest(name.trim(), password);
      const snap = await getDoc(doc(db, "guestProfiles", user.uid));
      const profile = snap.exists()
        ? { name: snap.data().name || name.trim(), avatarUrl: snap.data().avatarUrl || "" }
        : { name: name.trim(), avatarUrl: "" };

      setCachedProfile(profile);
      setLastGuestName(profile.name);
      onDone(profile);
    } catch (err) {
      console.error(err);
      setError(friendlyError("login", err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pw-modal-backdrop">
      <div className="pw-modal">
        <h2>Welcome to the Photo Wall</h2>
        <p className="pw-modal-sub">
          Register once, then log back in anytime — on any phone — to post
          and manage your photos.
        </p>

        <div className="pw-auth-tabs">
          <button
            type="button"
            className={`pw-auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => switchMode("register")}
          >
            New guest
          </button>
          <button
            type="button"
            className={`pw-auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Log in
          </button>
        </div>

        {mode === "register" ? (
          <form onSubmit={handleRegister}>
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
              <label>Choose a password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>

            <div className="pw-field">
              <label>Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Type it again"
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

            {error && <p className="pw-error">{error}</p>}

            <div className="pw-modal-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
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
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
              />
            </div>

            {error && <p className="pw-error">{error}</p>}

            <div className="pw-modal-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
