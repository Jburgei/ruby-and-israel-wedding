import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "#story", label: "Our Story" },
  { href: "#details", label: "Details" },
  { href: "#getting-there", label: "Getting There" },
  { href: "#gift", label: "Gift" },
  { href: "#gallery", label: "Gallery" },
  { href: "#rsvp", label: "RSVP" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  const handleLinkClick = () => setOpen(false);

  return (
    <header className="nav">
      <div className="nav-inner">
        <a href="#top" className="nav-brand">
          R<span className="hero-amp">&amp;</span>I
        </a>

        <nav className="nav-links nav-links-desktop">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <button
          className="nav-toggle"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="nav-links nav-links-mobile">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={handleLinkClick}>
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}