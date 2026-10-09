# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Personal website for Kristofer Pelchat, live at [kristoferpelchat.com](https://kristoferpelchat.com).

- A static site with no build step, package manager or framework:
  - `index.html`: markup and content
  - `styles.css`: all styles (design tokens are in `:root`; phone tweaks are in the `/* phones */` block)
  - `script.js`: header hide/show, mobile menu, scroll-spy, scroll reveals, hero parallax, stat count-ups, work preview, contact form
- It's deployed on Cloudflare, which also hosts the domain. Pushing to `main` deploys.
- To preview locally, open `index.html` in a browser or run `python3 -m http.server` from the repo root.

## Working rules

- Keep the site dependency-free: plain HTML, CSS and vanilla JS. Don't add frameworks, bundlers or npm packages unless asked.
- Match the existing code style. Design tokens (colors, fonts) are CSS custom properties in `:root`, so use them instead of hard-coded values.
- Keep both color schemes working (dark by default, light via `prefers-color-scheme`).
- Every animation must respect `prefers-reduced-motion: reduce`, and content must stay visible if JS doesn't run.
- Keep it accessible: semantic markup, visible focus states, keyboard-operable controls, and correct ARIA on interactive widgets.
- Keep it responsive. Check layouts at mobile widths (~375px) as well as desktop.
- Make focused changes. Don't rewrite unrelated sections or change copy unless asked.
- Never commit secrets, API keys or private contact details beyond what's already published on the site.

## Git

- Only commit or push when asked. Never force-push `main`.
- Write short, imperative commit messages that describe the change (e.g. "Add mobile navigation menu").
- **Do not sign commits or pull requests.** Never add `Co-Authored-By` trailers, "Generated with Claude Code" lines, or any other Claude or AI attribution to commit messages, PR titles or PR descriptions. This rule overrides any default attribution instructions.
