# site

Source for my personal website: a static page made of `index.html`, `styles.css` and `script.js`, plus a Cloudflare Pages Function (`functions/api/contact.js`) that sends contact-form messages. There's no build step.

**View it live:** [kristoferpelchat.com](https://kristoferpelchat.com)

## Deployment

The site is deployed with [Cloudflare Pages](https://pages.cloudflare.com/), and Cloudflare also hosts the `kristoferpelchat.com` domain.

- Merging into `main` deploys to production.
- Every other branch gets a preview at `https://<branch>.site-cq6.pages.dev`, linked from the "Cloudflare Pages" check on its pull request.

Changes go through a feature branch and a pull request, which Claude reviews through GitHub Actions (`.github/workflows/`).

## Contact form

The form posts to `/api/contact`. That function checks [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) to block spam, then emails the message through [Resend](https://resend.com) to kris@kristoferpelchat.com, with the visitor's address as reply-to.

Set these environment variables in the Cloudflare Pages project (Settings → Variables and Secrets) for both Production and Preview:

| Variable | Required | Value |
| --- | --- | --- |
| `RESEND_API_KEY` | Yes (secret) | API key from Resend |
| `TURNSTILE_SECRET_KEY` | Yes (secret) | Secret key from the Turnstile widget |
| `CONTACT_TO` | No | Recipient address, default `kris@kristoferpelchat.com` |
| `CONTACT_FROM` | No | Sender address on the Resend-verified domain, default `kris@kristoferpelchat.com` |

The Turnstile **site** key is public and goes in the `data-sitekey` attribute in `index.html`.

To run it locally, put the variables in a git-ignored `.dev.vars` file and run `npx wrangler pages dev .`.
