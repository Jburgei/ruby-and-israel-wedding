import React from "react";

const COLORS = ["var(--blush-dark)", "var(--coral)"];

export default function Pattern() {
  const items = Array.from({ length: 34 });
  return (
    <div className="pattern" aria-hidden="true">
      {items.map((_, i) => (
        <span key={i} style={{ background: COLORS[i % COLORS.length] }} />
      ))}
    </div>
  );
}
