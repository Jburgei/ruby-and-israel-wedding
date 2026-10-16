import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Image as ImageIcon, Heart, Gift as GiftIcon, User, Plus, Copy, Check } from "lucide-react";

const PAYBILL_NUMBER = "4816627";

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be unavailable (e.g. no HTTPS) — fail quietly.
    }
  }

  return (
    <div className="pw-gift-field">
      <div>
        <div className="pw-gift-field-label">{label}</div>
        <div className="pw-gift-field-value">{value}</div>
      </div>
      <button type="button" className="pw-copy-btn" onClick={handleCopy}>
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function GiftPage({ profile }) {
  const [accountName, setAccountName] = useState(profile?.name || "");

  return (
    <div className="pw-gift-page">
      <h1>Send a gift</h1>
      <p>You can send a gift to Ruby and Israel via M-PESA Paybill.</p>

      <CopyField label="M-PESA Paybill" value={PAYBILL_NUMBER} />

      <div className="pw-field" style={{ marginTop: 16 }}>
        <label>Account number (your name)</label>
        <input
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
        />
      </div>

      {accountName.trim() && <CopyField label="Account number" value={accountName.trim()} />}

      <p className="pw-gift-note">
        Go to M-PESA &rarr; Lipa na M-PESA &rarr; Pay Bill, enter the Paybill
        number above, and use your name as the account number so the couple
        knows who the gift is from.
      </p>
    </div>
  );
}
import { db, onAuthChange, logoutGuest } from "../firebase";
import {
  getCachedProfile,
  setCachedProfile,
  clearCachedProfile,
} from "../lib/guestProfile";
import ProfileSetupModal from "../components/photowall/ProfileSetupModal.jsx";
import NewPostModal from "../components/photowall/NewPostModal.jsx";
import PostCard from "../components/photowall/PostCard.jsx";
import Lightbox from "../components/photowall/Lightbox.jsx";

export default function PhotoWall() {
  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(() => getCachedProfile());
  const [posts, setPosts] = useState([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [tab, setTab] = useState("moments"); // "moments" | "blessings" | "gift" | "me"

  useEffect(() => {
    // Only the very first auth check after the page loads should ever sign
    // someone back out for having no profile doc yet — that's the signal
    // for a leftover pre-account session. A fresh join that just happened
    // in this same page load fires its own auth event too, and its profile
    // doc may simply not have finished writing yet — that one must never
    // trigger a sign-out, or joining can never actually complete.
    let isInitial = true;

    const unsub = onAuthChange((user) => {
      const isFirstCheck = isInitial;
      isInitial = false;

      setAuthUser(user);
      setAuthReady(true);
      if (user) {
        getDoc(doc(db, "guestProfiles", user.uid)).then((snap) => {
          if (snap.exists()) {
            const p = {
              name: snap.data().name || "Guest",
              phone: snap.data().phone || "",
              isAdmin: !!snap.data().isAdmin,
            };
            setProfile(p);
            setCachedProfile(p);
          } else if (isFirstCheck) {
            logoutGuest();
          }
        });
      } else {
        setProfile(null);
        clearCachedProfile();
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authUser || !profile) return;
    setDoc(
      doc(db, "guestVisits", authUser.uid),
      {
        name: profile.name || "",
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
  }, [authUser, profile]);

  const moments = useMemo(
    () => posts.filter((p) => p.type === "moment" || (!p.type && p.imageUrl)),
    [posts]
  );
  const blessings = useMemo(
    () => posts.filter((p) => p.type === "blessing" || (!p.type && !p.imageUrl)),
    [posts]
  );
  const myMoments = useMemo(
    () => (authUser ? moments.filter((p) => p.uid === authUser.uid) : []),
    [moments, authUser]
  );

  function handleLogout() {
    logoutGuest();
  }

  if (!authReady) {
    return <div className="pw-page" />;
  }

  if (!authUser) {
    return <ProfileSetupModal onDone={(p) => setProfile(p)} />;
  }

  if (!profile) {
    return <div className="pw-page" />;
  }

  const myInitial = (profile.name || "G").charAt(0).toUpperCase();

  return (
    <div className="pw-page">
      <div className="pw-topbar">
        <span className="pw-monogram">I&nbsp;|&nbsp;R</span>
      </div>

      {(tab === "moments" || tab === "blessings") && (
        <>
          <div className="pw-header">
            <h1>Ruby &amp; Israel</h1>
            <p>4 December 2026 &middot; CITAM Karen</p>
          </div>

          <div className="pw-tabswitch">
            <button
              type="button"
              className={`pw-tabswitch-btn ${tab === "moments" ? "active" : ""}`}
              onClick={() => setTab("moments")}
            >
              Moments
            </button>
            <button
              type="button"
              className={`pw-tabswitch-btn ${tab === "blessings" ? "active" : ""}`}
              onClick={() => setTab("blessings")}
            >
              Blessings
            </button>
          </div>

          <button
            type="button"
            className="pw-composer-bar"
            onClick={() => setShowNewPost(true)}
          >
            <span className="pw-composer-avatar">{myInitial}</span>
            <span className="pw-composer-placeholder">
              {tab === "moments" ? "Share a photo..." : "Share a blessing..."}
            </span>
          </button>

          {tab === "moments" ? (
            <div className="pw-feed">
              {moments.length === 0 && (
                <p className="pw-empty">
                  The wall is quiet for now — be the first to share a photo.
                </p>
              )}
              {moments.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  myProfile={profile}
                  onExpand={() =>
                    setLightboxIndex(moments.findIndex((p) => p.id === post.id))
                  }
                />
              ))}
            </div>
          ) : (
            <div className="pw-feed">
              {blessings.length === 0 && (
                <p className="pw-empty">
                  No blessings yet — be the first to write one.
                </p>
              )}
              {blessings.map((post) => (
                <PostCard key={post.id} post={post} myProfile={profile} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "gift" && (
        <GiftPage profile={profile} />
      )}

      {tab === "me" && (
        <>
          <div className="pw-profile-header">
            <span className="pw-profile-avatar">{myInitial}</span>
            <h2>{profile.name || "Guest"}</h2>
          </div>

          <p className="pw-profile-sub" style={{ textAlign: "center" }}>
            Your moments
          </p>

          <div className="pw-feed">
            {myMoments.length === 0 && (
              <p className="pw-empty">
                You haven't shared anything yet. Tap Share to add your first
                moment.
              </p>
            )}
            {myMoments.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                myProfile={profile}
                onExpand={() =>
                  setLightboxIndex(myMoments.findIndex((p) => p.id === post.id))
                }
              />
            ))}
          </div>

          <button type="button" className="pw-logout-link" onClick={handleLogout}>
            Log out
          </button>
        </>
      )}

      <div className="pw-bottomnav">
        <button
          type="button"
          className={`pw-navbtn ${tab === "moments" ? "active" : ""}`}
          onClick={() => setTab("moments")}
        >
          <ImageIcon size={20} />
          <span>Moments</span>
        </button>
        <button
          type="button"
          className={`pw-navbtn ${tab === "blessings" ? "active" : ""}`}
          onClick={() => setTab("blessings")}
        >
          <Heart size={20} />
          <span>Blessings</span>
        </button>
        <button
          type="button"
          className="pw-navbtn-share"
          onClick={() => setShowNewPost(true)}
          aria-label="Share a moment"
        >
          <Plus size={24} />
        </button>
        <button
          type="button"
          className={`pw-navbtn ${tab === "gift" ? "active" : ""}`}
          onClick={() => setTab("gift")}
        >
          <GiftIcon size={20} />
          <span>Gift</span>
        </button>
        <button
          type="button"
          className={`pw-navbtn ${tab === "me" ? "active" : ""}`}
          onClick={() => setTab("me")}
        >
          <User size={20} />
          <span>Me</span>
        </button>
      </div>

      {showNewPost && (
        <NewPostModal
          profile={profile}
          onClose={() => setShowNewPost(false)}
          onPosted={() => {
            setShowNewPost(false);
            setTab("moments");
          }}
        />
      )}

      {lightboxIndex !== null && (
        <Lightbox
          posts={moments}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={setLightboxIndex}
        />
      )}
    </div>
  );
}
