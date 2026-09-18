# Smart Start International School website

## Run locally

Serve the folder with a static web server (for example, VS Code Live Server),
then open the root URL, such as `http://127.0.0.1:5500/`. Pages use clean
URLs such as `/about`, `/programs`, and `/apply`, each backed by a directory
with an `index.html` file so direct visits and refreshes work on Live Server.
Static servers may initially add a trailing slash; the page removes it from
the address bar using the History API, preserving query strings and anchors.
The duplicate root-level `.html` pages have been removed; use the clean URLs.
All pages share
`styles.css` and `script.js`. Use a server for clean URLs rather than opening
files directly.

## Styling with Tailwind CSS

Install dependencies with `npm install`, then run `npm run build` to compile
`src/styles.css` into the shared `styles.css`. Run `npm run dev` to rebuild
automatically while editing. The generated CSS is included so the pages can
still be opened directly without Node.js or a browser CDN.

Run `npm run dev` from this project folder and keep it running alongside
Live Server. Each save to `src/styles.css` should print `Done` in that terminal.
If the browser still shows old styles, refresh with Ctrl+F5.

Edit `src/styles.css`, not the generated `styles.css`. Shared components use
Tailwind's `@apply` utilities alongside custom school branding. Tailwind scans
the root and route HTML pages and `script.js`, so utility classes can also be added to
the HTML files. The original base styles are retained instead of
Preflight to preserve heading and paragraph spacing.

## Pages

Home, About School, Programs, Teachers, News, Events, Gallery, Contact, and Apply Now. The Khmer / English / Chinese selector remembers the visitor's choice.

Each page contains its complete HTML. Edit `index.html` for Home or
`about/index.html`, `programs/index.html`, etc. for the other pages.
Edit `header.html` to change the shared top bar and navigation. Edit `footer.html`
to change the shared footer. All eight content pages load these two files through
`script.js`, which also highlights the current navigation link and handles
interactions and language selection after the shared markup loads. Internal links
replace page content while retaining the header and footer, so the logo stays in
place. Browser Back/Forward and direct page visits remain supported. Use Live Server
or another HTTP server; shared includes cannot load when opening HTML via `file://`.
Start Live Server from `index.html` to preview the complete website. Opening
`header.html` or `footer.html` directly redirects to the homepage.
The `/apply` page remains a redirect to Contact. English comes from the HTML files.
`translations-km.js` and `translations-zh.js` contain Khmer and Simplified Chinese
translations for all page text, form labels,
validation messages, page titles, and accessibility labels. When editing English
content, update its corresponding entry in both dictionaries as well. Email addresses,
phone numbers, and language names remain unchanged.

## Student rankings

Edit `rankings/index.html` to change class labels and the three student names in
each class. The initial template contains Kindergarten 1–3 and Grades 1–6;
add, rename, or remove class cards to match the school. Replace `To be announced`
with confirmed names, and update the results notice when rankings are published.
