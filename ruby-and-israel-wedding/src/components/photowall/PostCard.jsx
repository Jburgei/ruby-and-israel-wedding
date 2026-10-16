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

function formatLikesLabel(likes) {
  if (likes.length === 0) return null;
  const named = likes.filter((l) => l.name);
  if (named.length === 0) {
    return `${likes.length} like${likes.length === 1 ? "" : "s"}`;
  }
  const first = named[0].name;
  const remaining = likes.length - 1;
  if (remaining <= 0) return `Liked by ${first}`;
  return `Liked by ${first} and ${remaining} other${remaining === 1 ? "" : "s"}`;
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
  const isOwner = uid && post.uid === uid;
  const hasImage = !!post.imageUrl;

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
    if (!hasImage) return;
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
    if (!window.confirm("Delete this post? This can't be undone.")) return;
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

  const likesLabel = formatLikesLabel(likes);

  return (
    <div id={`post-${post.id}`} className="pw-post-wrap">
      <div className="pw-post">
        <div className="pw-post-header">
          <div className="pw-post-header-left">
            {post.authorAvatarUrl ? (
              <img src={post.authorAvatarUrl} alt="" className="pw-avatar" />
            ) : (
              <div className="pw-avatar pw-avatar-fallback">
                {(post.authorName || "G").charAt(0).toUpperCase()}
              </div>
            )}
            <span>{post.authorName || "Guest"}</span>
          </div>

          {isOwner && (
            <button
              type="button"
              className="pw-delete-btn"
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Delete post"
            >
              <Trash2 size={17} />
            </button>
          )}
        </div>

        {hasImage && (
          <div className="pw-image-wrap" onDoubleClick={handleDoubleTap}>
            <img src={post.imageUrl} alt="" className="pw-post-image" />
            {burst && (
              <Heart
                className="pw-heart-burst"
                size={90}
                fill="#5e1b30"
                color="#5e1b30"
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
        )}

        {!hasImage && post.caption && (
          <p className="pw-text-post">{post.caption}</p>
        )}

        <div className="pw-actions">
          <button
            type="button"
            className={`pw-icon-btn ${liked ? "pw-liked" : ""}`}
            onClick={toggleLike}
            aria-label={liked ? "Unlike" : "Like"}
          >
            <Heart size={24} fill={liked ? "#5e1b30" : "none"} color={liked ? "#5e1b30" : "#16233f"} />
          </button>
          <button
            type="button"
            className="pw-icon-btn"
            onClick={toggleComments}
            aria-label="Comments"
          >
            <MessageCircle size={23} color="#16233f" />
          </button>
        </div>

        {likesLabel && <p className="pw-likes">{likesLabel}</p>}

        {hasImage && post.caption && (
          <p className="pw-post-caption">
            <strong>{post.authorName || "Guest"}</strong> {post.caption}
          </p>
        )}

        {!showComments && (post.commentCount || 0) > 0 && (
          <button type="button" className="pw-comment-toggle" onClick={toggleComments}>
            View all {post.commentCount} comment{post.commentCount === 1 ? "" : "s"}
          </button>
        )}

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
    </div>
  );
}
