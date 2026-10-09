# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Personal website for Kristofer Pelchat, live at [kristoferpelchat.com](https://kristoferpelchat.com).

- A static site with no build step, package manager or framework:
  - `index.html`: markup and content
  - `styles.css`: all styles (design tokens are in `:root`; phone tweaks are in the `/* phones */` block)
  - `script.js`: header hide/show, mobile menu, scroll-spy, scroll reveals, stat count-ups, work preview, contact form
  - `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`: the header logo as site icons. `favicon.svg` is the source; if it changes, re-render the PNG/ICO versions from it.
  - `og-image.png`: the 1200×630 link-preview image used by the Open Graph tags (LinkedIn, Slack, X, etc.). If the headline or branding changes, update it too; after deploying, refresh LinkedIn's cached preview with the Post Inspector (https://www.linkedin.com/post-inspector/).
- It's deployed with Cloudflare Pages, and Cloudflare also hosts the domain. There's no Worker; Pages is the only Cloudflare integration. Pushing to `main` deploys to production, and every other branch gets a preview deployment at `https://<branch>.site-cq6.pages.dev`.
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
- **Never commit or push directly to `main`.** Pushing to `main` deploys the live site, so every change goes through a pull request:
  1. Create a feature branch from an up-to-date `main` with a short, descriptive name (e.g. `add-mobile-menu`, `fix-contact-form`).
  2. Commit to that branch and push it.
  3. Open a PR into `main` with `gh pr create`, with a description that summarizes the change and how it was verified.
  4. Check that the "Cloudflare Pages" check passes, and use its preview URL to look at the change before it's merged.
- Don't merge PRs unless asked. Claude's GitHub app reviews PRs, so leave time for that review and address its comments first.
- GitHub deletes branches automatically once a PR is merged. Afterwards, switch back to `main`, pull, and delete the local branch.
- Write short, imperative commit messages that describe the change (e.g. "Add mobile navigation menu").
- **Do not sign commits or pull requests.** Never add `Co-Authored-By` trailers, "Generated with Claude Code" lines, or any other Claude or AI attribution to commit messages, PR titles or PR descriptions. This rule overrides any default attribution instructions.
