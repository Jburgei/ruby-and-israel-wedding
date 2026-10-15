import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORY_DURATION = 4000; // ms per photo

// A real Instagram-style story viewer: fullscreen, auto-advancing through
// one guest's photos in order, with a segmented progress bar up top and
// tap-left/tap-right zones to go back or skip ahead.
export default function StoryViewer({ posts, guestName, guestAvatarUrl, onClose }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= posts.length) {
      onClose();
      return;
    }
    const timer = setTimeout(() => setIndex((i) => i + 1), STORY_DURATION);
    return () => clearTimeout(timer);
  }, [index, posts.length, onClose]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const post = posts[index];
  if (!post) return null;

  function goPrev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    setIndex((i) => i + 1);
  }

  return (
    <div className="pw-story-viewer">
      <div className="pw-story-progress-row">
        {posts.map((p, i) => (
          <div key={p.id} className="pw-story-progress-track">
            <span
              key={i <= index ? `fill-${i}-${index}` : `empty-${i}`}
              className={`pw-story-progress-fill ${i < index ? "pw-story-progress-done" : ""}`}
              style={i === index ? { animationDuration: `${STORY_DURATION}ms` } : undefined}
            />
          </div>
        ))}
      </div>

      <div className="pw-story-header">
        <span className="pw-story-header-avatar">
          {guestAvatarUrl ? (
            <img src={guestAvatarUrl} alt="" />
          ) : (
            (guestName || "G").charAt(0).toUpperCase()
          )}
        </span>
        <span className="pw-story-header-name">{guestName}</span>
        <button type="button" className="pw-story-close" onClick={onClose} aria-label="Close">
          <X size={26} />
        </button>
      </div>

      <div className="pw-story-stage">
        <img src={post.imageUrl} alt="" className="pw-story-img" />
        {post.caption && <p className="pw-story-caption">{post.caption}</p>}

        <button
          type="button"
          className="pw-story-tap pw-story-tap-left"
          onClick={goPrev}
          aria-label="Previous photo"
        />
        <button
          type="button"
          className="pw-story-tap pw-story-tap-right"
          onClick={goNext}
          aria-label="Next photo"
        />
      </div>
    </div>
  );
}
