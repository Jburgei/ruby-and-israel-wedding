import React, { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Camera } from "lucide-react";
import Reveal from "./shared/Reveal.jsx";

const SLIDES = [
  { src: "/images/Hero_1.PNG", alt: "Ruby and Israel" },
  { src: "/images/Our_story.jpg", alt: "Ruby and Israel" },
  { src: "/images/Gallery_3.jpg", alt: "Ruby and Israel" },
  { src: "/images/Gallery_4.jpg", alt: "Ruby and Israel" },
];

const ROTATIONS = [-3, 2.5, -2, 3.5];

export default function Gallery() {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(null); // "next" | "prev" | null

  const isFirst = index === 0;
  const isLast = index === SLIDES.length - 1;

  const changeSlide = useCallback(
    (dir) => {
      if (leaving) return;
      if (dir === "next" && isLast) return;
      if (dir === "prev" && isFirst) return;
      setLeaving(dir);
      window.setTimeout(() => {
        setIndex((i) => (dir === "next" ? i + 1 : i - 1));
        setLeaving(null);
      }, 380);
    },
    [leaving, isFirst, isLast]
  );

  const goTo = (i) => {
    if (leaving) return;
    setIndex(Math.max(0, Math.min(SLIDES.length - 1, i)));
  };

  return (
    <section className="gallery" id="gallery">
      <Reveal>
        <p className="eyebrow">Moments</p>
        <h2>Gallery</h2>
      </Reveal>

      <div className="gallery-frame">
        <div className="gallery-stack">
          {SLIDES.map((slide, i) => {
            const order = i - index;
            if (order < 0) return null; // already passed, not re-shown (non-circular)
            const isFront = order === 0;
            const baseRotate = ROTATIONS[i % ROTATIONS.length];

            let transform = `translate(${order * 5}px, ${order * 7}px) rotate(${baseRotate + order * 1.5}deg) scale(${1 - order * 0.035})`;
            let opacity = order > 2 ? 0 : 1;
            let transition = "transform 0.5s ease, opacity 0.5s ease";

            if (isFront && leaving === "next") {
              transform = `translate(130%, -10px) rotate(${baseRotate + 22}deg) scale(0.9)`;
              opacity = 0;
              transition = "transform 0.38s ease-in, opacity 0.38s ease-in";
            } else if (isFront && leaving === "prev") {
              transform = `translate(-130%, -10px) rotate(${baseRotate - 22}deg) scale(0.9)`;
              opacity = 0;
              transition = "transform 0.38s ease-in, opacity 0.38s ease-in";
            }

            return (
              <div
                className="gallery-polaroid"
                key={slide.src || i}
                style={{
                  transform,
                  opacity,
                  transition,
                  zIndex: SLIDES.length - order,
                  pointerEvents: isFront ? "auto" : "none",
                }}
              >
                <div className="gallery-photo-well">
                  {slide.src ? (
                    <img className="gallery-img" src={slide.src} alt={slide.alt} />
                  ) : (
                    <div className="gallery-placeholder">
                      <Camera size={28} strokeWidth={1.1} />
                      <span>{slide.alt}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="gallery-nav gallery-prev"
          type="button"
          aria-label="Previous photo"
          onClick={() => changeSlide("prev")}
          disabled={isFirst}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          className="gallery-nav gallery-next"
          type="button"
          aria-label="Next photo"
          onClick={() => changeSlide("next")}
          disabled={isLast}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="gallery-dots">
        {SLIDES.map((s, i) => (
          <button
            key={i}
            type="button"
            className={`gallery-dot ${i === index ? "active" : ""}`}
            aria-label={`Go to photo ${i + 1}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      <p className="gallery-caption">Ruby &amp; Israel &middot; December 2026</p>
    </section>
  );
}
