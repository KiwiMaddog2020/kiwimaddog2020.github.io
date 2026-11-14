# Brand sources

`social-card.html` and `icon.html` are the sources for `assets/social-card.png`
and the three favicon PNGs. To rebuild after a design change: serve the repo
(`python3 -m http.server 8000`), open each page in a browser at its stated size
(1200x630 and 512x512), take a screenshot, and resize the icon to 16, 32 and
180 pixels. Bump the `?v=` on the social card URL in `index.html` and the
layouts so link previews refresh.
