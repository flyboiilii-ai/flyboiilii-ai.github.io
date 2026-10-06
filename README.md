# Hady Ashraf — portfolio

A single static page. No build step, no framework.

```
index.html          the page
assets/
  fonts/            Archivo (display font only; body text uses the system font)
  img/              every photo as AVIF + WebP in three widths
  og-image.png      1200×630 preview image for links shared on LinkedIn, WhatsApp, X
  src/              the original photos (not used by the page; keep them for future edits)
_headers            security headers — used by Netlify only; GitHub Pages ignores it, which is fine
```

## Re-upload to GitHub Pages (flyboiilii-ai.github.io)

1. Open https://github.com/flyboiilii-ai/flyboiilii-ai.github.io and sign in.
2. Delete the old files first so nothing stale stays behind: open each of `index.html`, `og-image.png`, `_headers`
   and the old `ai-content` folder's files, and use the trash icon → "Commit changes". (Deleting the folder's
   last file removes the folder.)
3. **Add file → Upload files.** Drag in `index.html`, `_headers`, `README.md` and the whole **`assets`** folder.
   Drop the folder itself so the files land under `assets/…`.
4. **Commit changes.** Wait one to two minutes, then open https://flyboiilii-ai.github.io/ and refresh with Ctrl+F5.

## After deploy

- Share-preview image: LinkedIn and WhatsApp cache the old preview. Paste the URL into
  https://www.linkedin.com/post-inspector/ once to refresh it.
- The page is now indexable (no `noindex`). If you ever want it hidden from search again, add
  `<meta name="robots" content="noindex">` to the `<head>`.
- Scroll motion loads GSAP from cdnjs after the page has painted. If cdnjs is unreachable, the page simply has no
  parallax; nothing else changes.

## Editing

- Add a video tile: in `index.html`, find the `clips` list in the script at the bottom and add one line
  `["p","<post id>","<account>","<label>","<title>",361]`, then put its cover image in `assets/img/` as
  `clip-<post id>-180/270/360.avif` and `.webp` (640-wide covers use 320/480/640).
- Replace a photo: export it as AVIF and WebP in the three widths used in `index.html` with the same names.
- Never upscale: the three widths must not exceed the original's width.
