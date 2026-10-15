import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Home, Heart, User } from "lucide-react";
import { db, ensureSignedIn } from "../firebase";
import { getGuestProfile, clearGuestProfile } from "../lib/guestProfile";
import ProfileSetupModal from "../components/photowall/ProfileSetupModal.jsx";
import NewPostModal from "../components/photowall/NewPostModal.jsx";
import PostCard from "../components/photowall/PostCard.jsx";
import Lightbox from "../components/photowall/Lightbox.jsx";
import StoryViewer from "../components/photowall/StoryViewer.jsx";

const ACCENTS = ["#f2c14e", "#ff8f66", "#ff9fc0", "#6fb8e8"];

export default function PhotoWall() {
  const [hasProfile, setHasProfile] = useState(!!getGuestProfile());
  const [posts, setPosts] = useState([]);
  const [guests, setGuests] = useState([]);
  const [myUid, setMyUid] = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [sortMode, setSortMode] = useState("recent"); // "recent" | "loved"
  const [onlyMine, setOnlyMine] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [storyGuest, setStoryGuest] = useState(null);

  const profile = getGuestProfile() || {};

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
    if (!hasProfile) return;
    const p = getGuestProfile() || {};
    ensureSignedIn().then((user) => {
      setMyUid(user.uid);
      setDoc(
        doc(db, "guestVisits", user.uid),
        {
          name: p.anonymous ? "" : p.name || "",
          anonymous: !!p.anonymous,
          avatarUrl: p.anonymous ? "" : p.avatarUrl || "",
          lastSeen: serverTimestamp(),
        },
        { merge: true }
      );
    });
  }, [hasProfile]);

  const guestsWithPosts = useMemo(
    () => guests.filter((g) => posts.some((p) => p.uid === g.id)),
    [guests, posts]
  );

  const storyPosts = useMemo(() => {
    if (!storyGuest) return [];
    return posts.filter((p) => p.uid === storyGuest.id).slice().reverse();
  }, [posts, storyGuest]);

  const displayedPosts = useMemo(() => {
    let list = posts;
    if (onlyMine && myUid) {
      list = list.filter((p) => p.uid === myUid);
    }
    if (sortMode === "loved") {
      list = [...list].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    }
    return list;
  }, [posts, sortMode, onlyMine, myUid]);

  function handleLogout() {
    clearGuestProfile();
    setHasProfile(false);
  }

  function handleGuestClick(guest) {
    const hasPosts = posts.some((p) => p.uid === guest.id);
    if (!hasPosts) return;
    setStoryGuest(guest);
  }

  if (!hasProfile) {
    return <ProfileSetupModal onDone={() => setHasProfile(true)} />;
  }

  const myInitial = (profile.anonymous ? "A" : (profile.name || "G").charAt(0)).toUpperCase();

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
            {!profile.anonymous && profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" />
            ) : (
              myInitial
            )}
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
                  Switch guest
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
            {!profile.anonymous && profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" />
            ) : (
              myInitial
            )}
          </span>
          <h2>{profile.anonymous ? "Anonymous Guest" : profile.name || "Guest"}</h2>
          <p>
            {displayedPosts.length} photo{displayedPosts.length === 1 ? "" : "s"}
          </p>
          <div className="pw-profile-links">
            <button type="button" className="pw-back-link" onClick={() => setOnlyMine(false)}>
              Back to wall
            </button>
            <button type="button" className="pw-back-link pw-back-link-solid" onClick={handleLogout}>
              Switch guest
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
                      {!g.anonymous && g.avatarUrl ? (
                        <img src={g.avatarUrl} alt="" />
                      ) : (
                        (g.anonymous ? "A" : (g.name || "G").charAt(0)).toUpperCase()
                      )}
                    </span>
                  </span>
                  <span className="pw-story-name">
                    {g.anonymous ? "Anon" : (g.name || "Guest").split(" ")[0]}
                  </span>
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
              {posts.length} photo{posts.length === 1 ? "" : "s"} &middot; {guests.length}{" "}
              guest{guests.length === 1 ? "" : "s"}
            </p>
          </div>
        </>
      )}

      <div className="pw-feed">
        {displayedPosts.length === 0 && (
          <p className="pw-empty">
            {onlyMine
              ? "You haven't shared a photo yet — tap + to post one."
              : "The wall is quiet for now — be the first to share a photo from today."}
          </p>
        )}
        {displayedPosts.map((post, i) => (
          <PostCard
            key={post.id}
            post={post}
            onExpand={() => setLightboxIndex(i)}
          />
        ))}
      </div>

      <button
        type="button"
        className="pw-fab"
        onClick={() => setShowNewPost(true)}
        aria-label="Add a photo"
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
          onClose={() => setShowNewPost(false)}
          onPosted={() => setShowNewPost(false)}
        />
      )}

      {lightboxIndex !== null && (
        <Lightbox
          posts={displayedPosts}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={setLightboxIndex}
        />
      )}

      {storyGuest && storyPosts.length > 0 && (
        <StoryViewer
          posts={storyPosts}
          guestName={storyGuest.anonymous ? "Anonymous" : storyGuest.name || "Guest"}
          guestAvatarUrl={!storyGuest.anonymous ? storyGuest.avatarUrl : ""}
          onClose={() => setStoryGuest(null)}
        />
      )}
    </div>
  );
}
