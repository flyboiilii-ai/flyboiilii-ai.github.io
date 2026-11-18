# Hady Ashraf · portfolio

A single static page. No build step, no framework. Hosted on GitHub Pages at https://flyboiilii-ai.github.io/.

```
index.html                 the page (all content and markup)
assets/
  css/site.css             design tokens, layout, themes per case study
  js/site.js               smooth scroll, hero entrance, credits roll, stacked sheets, JobPilot demo, AI reel
  js/pigment.js            the Egyptian blue WebGL field behind the hero
  js/tooth.js              the live 3D dental arch in the El Hoshy case (three.js, loads only near that section)
  vendor/                  GSAP 3.14.2 (+ ScrollTrigger, SplitText), Lenis 1.3.27, three.js r187 (module build)
  3d/                      hoshy-arch.glb (Draco) and the Draco decoder
  fonts/                   Archivo (variable width + weight), Martian Mono, Alexandria (Arabic)
  img/                     original portfolio images (ORIA, Sandra, AI clips, portrait)
  img/work/                images for the 2026 projects, AVIF + WebP in several widths
  og.jpg                   1200×630 preview image for links shared on LinkedIn, WhatsApp, X
  favicon.svg
_headers                   security headers for Netlify only; GitHub Pages ignores it
```

## Design notes

- **Palette.** Kohl `#0C0D11`, Tura limestone `#E6E4DE`, Egyptian blue `#1235A8`, Glow `#8AA2FF`. Egyptian blue is thought to be the first synthetic pigment, made in Egypt more than 4,500 years ago.
- **Case studies wear their own colours.** Each case is a `<section class="sheet t-…">`; the `t-hoshy`, `t-jobpilot`, `t-oria`, `t-sandra` and `t-escape` themes in `site.css` set its ground, ink, muted text and accent.
- **Type.** Archivo (its width axis animates on the hero name), Martian Mono for labels, Alexandria for Arabic.
- **Motion.** Everything that moves is skipped under "reduce motion", and the page is complete without JavaScript.

## Re-upload to GitHub Pages

Using the website (no tools needed):

1. Open https://github.com/flyboiilii-ai/flyboiilii-ai.github.io and sign in.
2. **Add file → Upload files.** Drag in `index.html`, `README.md`, `_headers` and the whole **`assets`** folder (drop the folder itself so the files land under `assets/…`).
3. **Commit changes.** Wait one to two minutes, then open https://flyboiilii-ai.github.io/ and refresh with Ctrl+F5.

Or with git: commit and `git push` to `main`.

## Editing

- **Text:** everything is in `index.html`; search for the words you want to change.
- **Add an AI clip to the reel:** copy one `<li class="clip">` inside `[data-reel-track]`, change the Instagram link, the title and the account line, and add its cover to `assets/img/` as `clip-<post id>-180/270/360.avif` and `.webp`.
- **Replace a photo:** export AVIF and WebP at the same widths and names. Never upscale: the largest width must not exceed the original's.
- **Credits roll:** each `<li class="credit" data-credit="…">` pairs with a `<figure data-media="…">` in `.credits-stage` that shows behind it.

## After deploy

- LinkedIn and WhatsApp cache link previews. Paste the URL into https://www.linkedin.com/post-inspector/ once to refresh it (the preview image is now `assets/og.jpg`).
