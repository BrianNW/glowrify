# Glowrify

Glowrify's full-stack booking and admin application is maintained separately in the private [glowrify-booking repository](https://github.com/BrianNW/glowrify-booking). It uses Next.js, TypeScript, and MySQL. Access to that repository is required to view its source and deployment guide.

## GitHub Pages

The GitHub Actions workflow publishes a curated static marketing site from `public/site/`. It includes the training intake PDF but does not publish or run the Next.js server, APIs, database, or admin tools. Booking links on Pages direct visitors to email. Live bookings and administration remain unavailable until the application is deployed to a Node.js-capable host.

Pushes to `main` deploy the static site. View the deployment URL and status in the repository's **Settings → Pages** and **Actions** tabs.

The GitHub repository is public. Do not commit credentials, `.env` files, database dumps, or other private data.
