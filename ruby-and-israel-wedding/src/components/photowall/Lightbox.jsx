import React, { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Lightbox({ posts, index, onClose, onChangeIndex }) {
  const post = posts[index];

  const goPrev = useCallback(() => {
    if (index > 0) onChangeIndex(index - 1);
  }, [index, onChangeIndex]);

  const goNext = useCallback(() => {
    if (index < posts.length - 1) onChangeIndex(index + 1);
  }, [index, posts.length, onChangeIndex]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goPrev, goNext]);

  if (!post) return null;

  return (
    <div className="pw-lightbox" onClick={onClose}>
      <button
        type="button"
        className="pw-lightbox-close"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={26} />
      </button>

      {index > 0 && (
        <button
          type="button"
          className="pw-lightbox-nav pw-lightbox-prev"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Previous photo"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      <img
        src={post.imageUrl}
        alt=""
        className="pw-lightbox-img"
        onClick={(e) => e.stopPropagation()}
      />

      {index < posts.length - 1 && (
        <button
          type="button"
          className="pw-lightbox-nav pw-lightbox-next"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Next photo"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {post.caption && (
        <p className="pw-lightbox-caption" onClick={(e) => e.stopPropagation()}>
          {post.caption}
        </p>
      )}
    </div>
  );
}
