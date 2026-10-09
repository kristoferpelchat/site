# site

Source for my personal website: a static page made of `index.html`, `styles.css` and `script.js`, with no build step.

**View it live:** [kristoferpelchat.com](https://kristoferpelchat.com)

## Deployment

The site is deployed with [Cloudflare Pages](https://pages.cloudflare.com/), and Cloudflare also hosts the `kristoferpelchat.com` domain.

- Merging into `main` deploys to production.
- Every other branch gets a preview at `https://<branch>.site-cq6.pages.dev`, linked from the "Cloudflare Pages" check on its pull request.

Changes go through a feature branch and a pull request, which Claude reviews through GitHub Actions (`.github/workflows/`).
