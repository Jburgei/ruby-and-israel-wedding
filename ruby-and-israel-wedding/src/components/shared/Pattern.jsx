import React from "react";

export default function Pattern({ color = "var(--gold)" }) {
  const items = Array.from({ length: 34 });
  return (
    <div className="pattern" aria-hidden="true">
      {items.map((_, i) => (
        <span key={i} style={{ background: color }} />
      ))}
    </div>
  );
}
