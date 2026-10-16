const PROFILE_KEY = "wed_guest_profile_cache";

// The guest's name + phone, cached locally so the app can show the wall
// straight away on return visits without waiting on a network round trip.
// This is what makes the phone "remember" the guest after their first visit.
export function getCachedProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Storage can fail in private-browsing modes — not worth surfacing.
  }
}

export function clearCachedProfile() {
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch {
    // ignore
  }
}
