# Neural Portfolio

A cinematic developer portfolio built with React, TypeScript, Vite, Tailwind CSS, Framer Motion, and GSAP.

## Experience Highlights

- Futuristic dark UI with glassmorphism and glow accents
- Animated boot sequence intro
- Floating command palette inspired by IDE workflows
- Keyboard-first navigation and section transitions
- Full-screen project expansion with dynamic previews
- GSAP scroll-triggered timeline and project parallax
- Custom cursor, particle field, magnetic button interactions
- Optional synthetic sound effects for hover/click feedback
- Hidden easter egg (Konami sequence)

## Tech Stack

- React 19 + TypeScript
- Vite 5
- Tailwind CSS 3
- Framer Motion
- GSAP + ScrollTrigger
- cmdk + lucide-react

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

## Keyboard Shortcuts

- Ctrl+K / Cmd+K: open command palette
- 1-5: jump to section
- Left / Right arrows: cycle between sections
- M: toggle sound effects
- P: toggle particle field
- R: toggle reduced motion mode
- D (Project Vault): toggle incident simulation mode

Command palette actions now include runtime toggles for sound, particles, and reduced-motion mode.

## Architecture Notes

- Route-like section swapping is orchestrated in `App.tsx` with lazy-loaded sections.
- Shared interaction primitives live in `src/hooks` and `src/components`.
- Data definitions are centralized in `src/data/siteData.ts`.
- GSAP is scoped using `gsap.context` to avoid animation leaks.
