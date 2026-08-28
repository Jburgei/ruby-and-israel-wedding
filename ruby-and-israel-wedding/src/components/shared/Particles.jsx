import React, { useMemo } from "react";

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function generateParticles(count) {
  return Array.from({ length: count }, () => ({
    left: randomBetween(2, 98),
    size: randomBetween(2, 5),
    duration: randomBetween(9, 18),
    delay: randomBetween(0, 10),
    drift: randomBetween(-30, 30),
  }));
}

export default function Particles({ count = 22 }) {
  const particles = useMemo(() => generateParticles(count), [count]);

  return (
    <div className="particles" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--drift": `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
