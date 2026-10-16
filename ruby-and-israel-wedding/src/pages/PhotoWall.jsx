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
import { Home, Heart, User } from "lucide-react";
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
import StoryViewer from "../components/photowall/StoryViewer.jsx";

const ACCENTS = ["#f2c14e", "#ff8f66", "#ff9fc0", "#6fb8e8"];

export default function PhotoWall() {
  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(() => getCachedProfile());
  const [posts, setPosts] = useState([]);
  const [guests, setGuests] = useState([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [sortMode, setSortMode] = useState("recent"); // "recent" | "loved"
  const [onlyMine, setOnlyMine] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [storyGuest, setStoryGuest] = useState(null);

  useEffect(() => {
    // Only the very first auth check after the page loads should ever sign
    // someone back out for having no profile doc yet — that's the signal
    // for a leftover pre-account session (e.g. an old anonymous sign-in).
    // A fresh register/login that just happened in this same page load
    // fires its own auth event too, and its profile doc may simply not
    // have finished writing yet — that one must never trigger a sign-out,
    // or registering/logging in can never actually complete.
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
              avatarUrl: snap.data().avatarUrl || "",
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
    const unsub = onSnapshot(collection(db, "guestVisits"), (snap) => {
      setGuests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authUser || !profile) return;
    setDoc(
      doc(db, "guestVisits", authUser.uid),
      {
        name: profile.name || "",
        avatarUrl: profile.avatarUrl || "",
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
  }, [authUser, profile]);

  const guestsWithPosts = useMemo(
    () => guests.filter((g) => posts.some((p) => p.uid === g.id && p.imageUrl)),
    [guests, posts]
  );

  const storyPosts = useMemo(() => {
    if (!storyGuest) return [];
    return posts
      .filter((p) => p.uid === storyGuest.id && p.imageUrl)
      .slice()
      .reverse();
  }, [posts, storyGuest]);

  const displayedPosts = useMemo(() => {
    let list = posts;
    if (onlyMine && authUser) {
      list = list.filter((p) => p.uid === authUser.uid);
    }
    if (sortMode === "loved") {
      list = [...list].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    }
    return list;
  }, [posts, sortMode, onlyMine, authUser]);

  // The lightbox only makes sense for photos — text-only posts are left out
  // so prev/next never lands on one with nothing to show.
  const photoPosts = useMemo(
    () => displayedPosts.filter((p) => p.imageUrl),
    [displayedPosts]
  );

  function handleLogout() {
    logoutGuest();
  }

  function handleGuestClick(guest) {
    const hasPhotoPosts = posts.some((p) => p.uid === guest.id && p.imageUrl);
    if (!hasPhotoPosts) return;
    setStoryGuest(guest);
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
        <div className="pw-avatar-menu-wrap">
          <button
            type="button"
            className="pw-topbar-avatar"
            onClick={() => setShowMenu((v) => !v)}
            aria-label="Account menu"
          >
            {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : myInitial}
          </button>
          {showMenu && (
            <>
              <div className="pw-menu-backdrop" onClick={() => setShowMenu(false)} />
              <div className="pw-avatar-menu">
                <button
                  type="button"
                  onClick={() => {
                    setOnlyMine(true);
                    setSortMode("recent");
                    setShowMenu(false);
                  }}
                >
                  My photos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    handleLogout();
                  }}
                >
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
        <span className="pw-topbar-title">Ruby &amp; Israel</span>
        <span className="pw-topbar-spacer" aria-hidden="true" />
      </div>

      {onlyMine ? (
        <div className="pw-profile-header">
          <span className="pw-profile-avatar">
            {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : myInitial}
          </span>
          <h2>{profile.name || "Guest"}</h2>
          <p>
            {displayedPosts.length} photo{displayedPosts.length === 1 ? "" : "s"}
          </p>
          <div className="pw-profile-links">
            <button type="button" className="pw-back-link" onClick={() => setOnlyMine(false)}>
              Back to wall
            </button>
            <button type="button" className="pw-back-link pw-back-link-solid" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      ) : (
        <>
          {guestsWithPosts.length > 0 && (
            <div className="pw-stories">
              {guestsWithPosts.map((g, i) => (
                <button
                  key={g.id}
                  type="button"
                  className="pw-story"
                  style={{ "--ring": ACCENTS[i % ACCENTS.length] }}
                  onClick={() => handleGuestClick(g)}
                >
                  <span className="pw-story-ring">
                    <span className="pw-story-avatar">
                      {g.avatarUrl ? (
                        <img src={g.avatarUrl} alt="" />
                      ) : (
                        (g.name || "G").charAt(0).toUpperCase()
                      )}
                    </span>
                  </span>
                  <span className="pw-story-name">{(g.name || "Guest").split(" ")[0]}</span>
                </button>
              ))}
            </div>
          )}

          <div className="pw-header">
            <h1>Ruby &amp; Israel</h1>
            <p>Guest photo wall</p>
            <div className="pw-divider">
              <span />
              <i />
              <span />
            </div>
            <p className="pw-stats">
              {posts.length} post{posts.length === 1 ? "" : "s"} &middot; {guests.length}{" "}
              guest{guests.length === 1 ? "" : "s"}
            </p>
          </div>
        </>
      )}

      <div className="pw-feed">
        {displayedPosts.length === 0 && (
          <p className="pw-empty">
            {onlyMine
              ? "You haven't shared anything yet — tap + to post a photo or a message."
              : "The wall is quiet for now — be the first to share a photo or a message."}
          </p>
        )}
        {displayedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            myProfile={profile}
            onExpand={() =>
              setLightboxIndex(photoPosts.findIndex((p) => p.id === post.id))
            }
          />
        ))}
      </div>

      <button
        type="button"
        className="pw-fab"
        onClick={() => setShowNewPost(true)}
        aria-label="Add a photo or message"
      >
        +
      </button>

      <div className="pw-bottomnav">
        <button
          type="button"
          className={`pw-navbtn ${sortMode === "recent" && !onlyMine ? "active" : ""}`}
          onClick={() => {
            setSortMode("recent");
            setOnlyMine(false);
          }}
        >
          <Home size={20} />
          <span>Wall</span>
        </button>
        <button
          type="button"
          className={`pw-navbtn ${sortMode === "loved" ? "active" : ""}`}
          onClick={() => {
            setSortMode("loved");
            setOnlyMine(false);
          }}
        >
          <Heart size={20} />
          <span>Loved</span>
        </button>
        <button
          type="button"
          className={`pw-navbtn ${onlyMine ? "active" : ""}`}
          onClick={() => setOnlyMine((v) => !v)}
        >
          <User size={20} />
          <span>Mine</span>
        </button>
      </div>

      {showNewPost && (
        <NewPostModal
          profile={profile}
          onClose={() => setShowNewPost(false)}
          onPosted={() => setShowNewPost(false)}
        />
      )}

      {lightboxIndex !== null && (
        <Lightbox
          posts={photoPosts}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={setLightboxIndex}
        />
      )}

      {storyGuest && storyPosts.length > 0 && (
        <StoryViewer
          posts={storyPosts}
          guestName={storyGuest.name || "Guest"}
          guestAvatarUrl={storyGuest.avatarUrl || ""}
          onClose={() => setStoryGuest(null)}
        />
      )}
    </div>
  );
}
