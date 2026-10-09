# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Personal website for Kristofer Pelchat, live at [kristoferpelchat.com](https://kristoferpelchat.com).

- A static site plus one Cloudflare Pages Function, with no build step, package manager or framework:
  - `index.html`: markup and content
  - `styles.css`: all styles (design tokens are in `:root`; phone tweaks are in the `/* phones */` block)
  - `script.js`: header hide/show, mobile menu, scroll-spy, scroll reveals, hero parallax, stat count-ups, work preview, contact form
  - `functions/api/contact.js`: handles `POST /api/contact`. It validates the form, verifies Cloudflare Turnstile, and sends the email through Resend. It needs the `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY` secrets set in the Pages project; `CONTACT_TO` and `CONTACT_FROM` are optional and default to kris@kristoferpelchat.com.
  - The public Turnstile site key goes in the `.cf-turnstile` element in `index.html`.
- It's deployed with Cloudflare Pages, and Cloudflare also hosts the domain. There's no Worker; Pages is the only Cloudflare integration. Pushing to `main` deploys to production, and every other branch gets a preview deployment at `https://<branch>.site-cq6.pages.dev`.
- To preview locally, run `npx wrangler pages dev .` from the repo root, which also serves the contact function. Put local secrets in `.dev.vars` (git-ignored). Cloudflare's Turnstile test keys (site key `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`) always pass. For pages without the form, opening `index.html` directly is enough.

## Working rules

- Keep the site dependency-free: plain HTML, CSS and vanilla JS. Don't add frameworks, bundlers or npm packages unless asked.
- Match the existing code style. Design tokens (colors, fonts) are CSS custom properties in `:root`, so use them instead of hard-coded values.
- Keep both color schemes working (dark by default, light via `prefers-color-scheme`).
- Every animation must respect `prefers-reduced-motion: reduce`, and content must stay visible if JS doesn't run.
- Keep it accessible: semantic markup, visible focus states, keyboard-operable controls, and correct ARIA on interactive widgets.
- Keep it responsive. Check layouts at mobile widths (~375px) as well as desktop.
- Make focused changes. Don't rewrite unrelated sections or change copy unless asked.
- Never commit secrets, API keys or private contact details beyond what's already published on the site. Server-side keys belong in the Pages project's environment variables, never in the code.

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
