# Ruby & Israel — Wedding Website

React + Vite site for Ruby (Peace Ruby Wangari Bukachi) and Israel
(Michael Israel Burgei, "Kip") — wedding December 4th, 2026, Nairobi.

## Structure

```
ruby-and-israel-wedding/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx              entry point
│   ├── App.jsx                composes all sections
│   ├── components/
│   │   ├── Hero.jsx
│   │   ├── SaveTheDate.jsx
│   │   ├── OurStory.jsx
│   │   ├── LetsCelebrate.jsx  event details (date / venue / time)
│   │   ├── RSVP.jsx
│   │   └── shared/
│   │       ├── Reveal.jsx     scroll-reveal wrapper + hook
│   │       ├── Pattern.jsx    decorative diamond divider
│   │       └── PhotoFrame.jsx placeholder photo frame
│   └── styles/
│       └── tokens.css         palette, type scale, all section styles
└── public/                    put real photos here once available
```

## Setup

```bash
npm install
npm run dev       # local dev server
npm run build     # production build to dist/
```

## Still to do

- **Photos**: `PhotoFrame` in `OurStory.jsx` (and eventually `Hero.jsx`) is a
  placeholder. Drop real photos in `public/` and swap the frame for an
  `<img>` tag once they're ready.
- **Venue**: still TBD as of this scaffold. `LetsCelebrate.jsx` shows
  "Details to follow" for the venue — update once confirmed, and wire the
  "Get directions" button to a real maps link.
- **RSVP submissions**: `RSVP.jsx` currently calls a stubbed
  `submitRsvp()` that just simulates a network request. Replace it with a
  real endpoint (Formspree, Getform, a small backend route, a spreadsheet
  webhook, etc.) before this goes live, or RSVPs won't actually be saved
  anywhere.
- **Mobile Figma**: desktop frames are done; mobile designs are still
  pending, so double check breakpoints once those exist.

## Palette

| Name | Hex |
|---|---|
| Navy | `#152340` |
| Gold | `#c69a3d` |
| Maroon | `#8c2846` |
| Dusty blue | `#7e93ac` |
| Cream | `#f2e2c2` |
