const KEY = "wed_guest_profile";
const RECENT_KEY = "wed_guest_recent_profiles";
const MAX_RECENT = 6;

export function getGuestProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Named guests who've set up a profile on this device, most recent first.
// Lets "Switch guest" be reversible — tap a name instead of retyping it.
export function getRecentProfiles() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveRecentProfiles(list) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    // storage full or unavailable — not critical, skip silently
  }
}

export function saveGuestProfile(profile) {
  localStorage.setItem(KEY, JSON.stringify(profile));

  // Anonymous posting has no name to remember by, so only named profiles
  // get added to the "continue as" list.
  if (!profile.anonymous && profile.name) {
    const recent = getRecentProfiles().filter(
      (p) => p.name.toLowerCase() !== profile.name.toLowerCase()
    );
    recent.unshift({
      name: profile.name,
      avatarUrl: profile.avatarUrl || "",
      lastUsed: Date.now(),
    });
    saveRecentProfiles(recent.slice(0, MAX_RECENT));
  }
}

// Clears the ACTIVE profile only. The device keeps the same underlying
// Firebase identity throughout (ensureSignedIn persists it), and the
// person's name/photo stays in the "recent" list so they can come back.
export function clearGuestProfile() {
  localStorage.removeItem(KEY);
}

export function forgetRecentProfile(name) {
  const recent = getRecentProfiles().filter(
    (p) => p.name.toLowerCase() !== name.toLowerCase()
  );
  saveRecentProfiles(recent);
}
