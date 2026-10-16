// Real identity now lives in Firebase Auth + the guestProfiles Firestore
// collection (see firebase.js: registerGuest/loginGuest). This file just
// keeps small local conveniences: a cached copy of the active profile so
// the UI can render instantly instead of waiting on a Firestore round
// trip, and the last name typed so the login form can prefill it.

const CACHE_KEY = "wed_guest_profile_cache";
const LAST_NAME_KEY = "wed_guest_last_name";

export function getCachedProfile() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedProfile(profile) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function clearCachedProfile() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}

export function getLastGuestName() {
  try {
    return localStorage.getItem(LAST_NAME_KEY) || "";
  } catch {
    return "";
  }
}

export function setLastGuestName(name) {
  try {
    localStorage.setItem(LAST_NAME_KEY, name);
  } catch {
    // ignore
  }
}
