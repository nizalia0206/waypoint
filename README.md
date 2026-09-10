# Waypoint — React version

A React + Vite port of the Waypoint DesignAthon prototype (mentor-matching for university students).

## Run it

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

## About the "live Claude match" feature

The **Find your mentor** section tries to call `https://api.anthropic.com/v1/messages`
directly from the browser. That worked inside the original claude.ai artifact sandbox
(which proxies the call for you), but a plain browser **cannot** call the Anthropic API
directly outside that sandbox — there's no public CORS access, and you'd be exposing an
API key in client-side code anyway.

Right now the app is wired so that when that call fails, it **falls back automatically**
to a local match (picks the alum with the same major and writes a templated reason) —
so the feature still works end-to-end for a demo.

If you want the real live-matching call to work:
1. Set up a small backend endpoint (Node/Express, a Vercel/Netlify function, etc.) that
   holds your `ANTHROPIC_API_KEY` server-side and forwards the prompt to
   `https://api.anthropic.com/v1/messages`.
2. In `src/components/MentorMatch.jsx`, point the `fetch()` call at your own endpoint
   instead of `api.anthropic.com` directly.

## Structure

```
src/
  App.jsx                 – page layout / section order
  App.css                 – all styling (ported 1:1 from the original design)
  data/alumni.js          – alumni pool used for matching
  data/notes.js           – trail notes (tips) seed data
  hooks/useToast.js        – simple toast notification hook
  components/
    Nav.jsx
    Hero.jsx
    Pathway.jsx            – the 5-step "how it works" timeline
    Trail3D.jsx            – three.js winding-trail visualization
    MentorMatch.jsx        – goal form, tags, matching, scheduling, follow-checklist
    TrailNotes.jsx         – searchable/filterable tips feed
    Rewards.jsx            – Trail Points + redemption catalog
    ProblemSolution.jsx    – problem/research/solution write-up
    Footer.jsx
```
