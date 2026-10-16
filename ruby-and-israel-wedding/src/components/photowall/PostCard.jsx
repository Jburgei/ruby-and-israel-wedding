import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  increment,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { Heart, MessageCircle, Trash2, Maximize2 } from "lucide-react";
import { db, storage, auth } from "../../firebase";

function timeAgo(timestamp) {
  if (!timestamp?.toDate) return "now";
  const seconds = Math.floor((Date.now() - timestamp.toDate().getTime()) / 1000);
  if (seconds < 5) return "now";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export default function PostCard({ post, myProfile, onExpand }) {
  const uid = auth.currentUser?.uid || null;
  const [likes, setLikes] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "posts", post.id, "likes"), (snap) => {
      setLikes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [post.id]);

  const liked = uid ? likes.some((l) => l.id === uid) : false;
  const isAdmin = !!myProfile?.isAdmin;
  const canDelete = uid && (post.uid === uid || isAdmin);
  const isMoment = post.type === "moment" || (!post.type && !!post.imageUrl);
  const initial = (post.authorName || "G").charAt(0).toUpperCase();

  async function toggleLike() {
    const user = auth.currentUser;
    if (!user) return;
    const likeRef = doc(db, "posts", post.id, "likes", user.uid);
    const postRef = doc(db, "posts", post.id);

    if (liked) {
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likeCount: increment(-1) });
    } else {
      await setDoc(likeRef, {
        name: myProfile?.name || "Guest",
        createdAt: serverTimestamp(),
      });
      await updateDoc(postRef, { likeCount: increment(1) });
    }
  }

  function handleDoubleTap() {
    if (!isMoment) return;
    setBurst(true);
    window.setTimeout(() => setBurst(false), 700);
    if (!liked) {
      toggleLike();
    }
  }

  function toggleComments() {
    const next = !showComments;
    setShowComments(next);

    if (next && comments.length === 0) {
      const q = query(
        collection(db, "posts", post.id, "comments"),
        orderBy("createdAt", "asc")
      );
      onSnapshot(q, (snap) => {
        setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSending(true);
    try {
      const user = auth.currentUser;

      await addDoc(collection(db, "posts", post.id, "comments"), {
        authorName: myProfile?.name || "Guest",
        text: commentText.trim(),
        createdAt: serverTimestamp(),
        uid: user.uid,
      });

      await updateDoc(doc(db, "posts", post.id), {
        commentCount: increment(1),
      });

      setCommentText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    const confirmMsg = isAdmin && post.uid !== uid
      ? "Remove this post for everyone? This can't be undone."
      : "Delete this post? This can't be undone.";
    if (!window.confirm(confirmMsg)) return;
    setDeleting(true);
    try {
      if (post.imageUrl) {
        try {
          await deleteObject(ref(storage, post.imageUrl));
        } catch (err) {
          console.warn("Could not delete image from storage:", err);
        }
      }
      await deleteDoc(doc(db, "posts", post.id));
    } catch (err) {
      console.error(err);
      alert("Could not delete this post. Please try again.");
      setDeleting(false);
    }
  }

  const deleteButton = canDelete && (
    <button
      type="button"
      className="pw-delete-btn"
      onClick={handleDelete}
      disabled={deleting}
      aria-label="Delete post"
      title={isAdmin && post.uid !== uid ? "Remove post (admin)" : "Delete post"}
    >
      <Trash2 size={17} />
    </button>
  );

  // Blessings (text-only) render as a flat blush card with just the
  // message, author and a heart — no photo, no comments.
  if (!isMoment) {
    return (
      <div id={`post-${post.id}`} className="pw-blessing">
        <p className="pw-blessing-text">{post.caption}</p>
        <div className="pw-blessing-footer">
          <span className="pw-blessing-author">{post.authorName || "Guest"}</span>
          <div className="pw-blessing-meta">
            <span className="pw-blessing-time">{timeAgo(post.createdAt)}</span>
            <button
              type="button"
              className="pw-icon-btn"
              onClick={toggleLike}
              aria-label={liked ? "Unlike" : "Like"}
            >
              <Heart size={18} fill={liked ? "#7A1E3A" : "none"} color="#7A1E3A" />
              {post.likeCount > 0 && <span className="pw-action-count">{post.likeCount}</span>}
            </button>
            {deleteButton}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id={`post-${post.id}`} className="pw-post">
      <div className="pw-post-header">
        <div className="pw-post-header-left">
          <div className="pw-avatar">{initial}</div>
          <span className="pw-post-name">{post.authorName || "Guest"}</span>
          <span className="pw-post-time">{timeAgo(post.createdAt)}</span>
        </div>
        {deleteButton}
      </div>

      {post.caption && <p className="pw-post-caption">{post.caption}</p>}

      <div className="pw-image-wrap" onDoubleClick={handleDoubleTap}>
        <img src={post.imageUrl} alt="" className="pw-post-image" />
        {burst && (
          <Heart
            className="pw-heart-burst"
            size={90}
            fill="#7A1E3A"
            color="#7A1E3A"
          />
        )}
        <button
          type="button"
          className="pw-expand-btn"
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          aria-label="View fullscreen"
        >
          <Maximize2 size={15} />
        </button>
      </div>

      <div className="pw-actions">
        <button
          type="button"
          className={`pw-icon-btn ${liked ? "pw-liked" : ""}`}
          onClick={toggleLike}
          aria-label={liked ? "Unlike" : "Like"}
        >
          <Heart size={21} fill={liked ? "#7A1E3A" : "none"} color={liked ? "#7A1E3A" : "#1B2A4A"} />
          {post.likeCount > 0 && <span className="pw-action-count">{post.likeCount}</span>}
        </button>
        <button
          type="button"
          className="pw-icon-btn"
          onClick={toggleComments}
          aria-label="Comments"
        >
          <MessageCircle size={20} color="#1B2A4A" />
          {post.commentCount > 0 && <span className="pw-action-count">{post.commentCount}</span>}
        </button>
      </div>

      {showComments && (
        <div className="pw-comments">
          {comments.map((c) => (
            <div key={c.id} className="pw-comment">
              <strong>{c.authorName}</strong> {c.text}
            </div>
          ))}

          <form className="pw-comment-form" onSubmit={handleComment}>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
            />
            <button type="submit" disabled={sending}>
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
