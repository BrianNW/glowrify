import { cp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const staticDirectory = path.join(repositoryDirectory, "public", "site");
const outputDirectory = process.argv[2] ? path.resolve(process.argv[2]) : undefined;

if (!outputDirectory) {
  throw new Error("Usage: node scripts/build-github-pages.mjs <empty-output-directory>");
}

const outputStats = await stat(outputDirectory).catch((error) => {
  if (error.code === "ENOENT") return undefined;
  throw error;
});
if (outputStats && (!outputStats.isDirectory() || (await readdir(outputDirectory)).length > 0)) {
  throw new Error("The GitHub Pages output directory must be empty.");
}

await mkdir(outputDirectory, { recursive: true });
for (const file of ["index.html", "pricing.html", "hours.html", "preparation.html", "post-op.html", "training.html", "training-intake.html", "styles.css", "pages-script.js"]) {
  await cp(path.join(staticDirectory, file), path.join(outputDirectory, file));
}
await cp(path.join(staticDirectory, "images"), path.join(outputDirectory, "images"), { recursive: true });
await cp(
  path.join(repositoryDirectory, "images", "logo-transparent1.png"),
  path.join(outputDirectory, "images", "logo-transparent1.png"),
);
await mkdir(path.join(outputDirectory, "documents"), { recursive: true });
await cp(
  path.join(repositoryDirectory, "public", "documents", "teeth-whitening-training-intake.pdf"),
  path.join(outputDirectory, "documents", "teeth-whitening-training-intake.pdf"),
);

const pathReplacements = [
  ["/site/index.html", "./index.html"],
  ["/site/pricing.html", "./pricing.html"],
  ["/site/hours.html", "./hours.html"],
  ["/site/preparation.html", "./preparation.html"],
  ["/site/post-op.html", "./post-op.html"],
  ["/training/intake", "./training-intake.html"],
  ["/training", "./training.html"],
  ["/documents/", "./documents/"],
];
const bookingInquiry = "mailto:glowrify.co@gmail.com?subject=Teeth%20whitening%20booking%20inquiry";
const htmlFiles = ["index.html", "pricing.html", "hours.html", "preparation.html", "post-op.html", "training.html", "training-intake.html"];

for (const file of htmlFiles) {
  const destination = path.join(outputDirectory, file);
  let html = await readFile(destination, "utf8");
  html = html.replaceAll('src="script.js"', 'src="pages-script.js"');
  html = html.replace(
    /<a\b([^>]*\bhref=["']\/bookings?\/?["'][^>]*)>([\s\S]*?)<\/a>/gi,
    (_anchor, attributes, content) => {
      const updatedAttributes = attributes
        .replace(/\bhref=["'][^"']+["']/i, `href="${bookingInquiry}"`)
        .replace(/\baria-label=["'][^"']*["']/i, 'aria-label="Email to ask about teeth whitening"');
      const updatedContent = content
        .replace(/Book a visit/gi, "Email to book")
        .replace(/Book now/gi, "Email to book");
      return `<a${updatedAttributes}>${updatedContent}</a>`;
    },
  );
  for (const [from, to] of pathReplacements) {
    html = html.replaceAll(`href="${from}`, `href="${to}`);
  }
  html = html.replace(
    "</header>",
    `</header>\n    <aside class="pages-static-notice" role="note">Online booking and admin tools are not available on this static site. To ask about a visit, email <a href="mailto:glowrify.co@gmail.com">glowrify.co@gmail.com</a>.</aside>`,
  );
  await writeFile(destination, html);
}

console.log(`Built GitHub Pages marketing site at ${outputDirectory}`);
