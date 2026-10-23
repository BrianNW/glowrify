# Glowrify Teeth Whitening

A responsive static website preview for Glowrify in Surrey, BC, Canada.

The site includes separate `pricing.html`, `hours.html`, `preparation.html`, and `post-op.html` pages for whitening prices, studio hours, pre-appointment guidance, and post-whitening instructions.

Each page has location-focused search metadata and social sharing previews. `sitemap.xml` lists the public pages, and `robots.txt` points crawlers to the sitemap.

## Preview locally

Open `index.html` in a browser. The fonts are loaded from Google Fonts; all site images are stored in `images/`.

## Deploy with GitHub Pages

The GitHub Actions workflow in `.github/workflows/pages.yml` deploys the site whenever changes are pushed to `main`. After the first deployment, the public site is available from the repository's **Settings → Pages** page.
