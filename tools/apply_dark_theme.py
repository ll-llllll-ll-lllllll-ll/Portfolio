from pathlib import Path

path = Path('style.css')
css = path.read_text(encoding='utf-8')
marker = '/* ===== Site-wide dark room theme ===== */'
if marker in css:
    raise SystemExit('dark theme already present')

block = r'''

/* ===== Site-wide dark room theme ===== */
/*
  Keep the ambient homepage as-is, but move every work / collection room into
  the same low-light visual world. Artwork keeps its original colour; only the
  interface, paper, grey stages, captions and editorial chrome are darkened.
*/
:root {
  --ink: #ecebe4;
  --paper: #0d0f0e;
  --black-hairline: rgba(244, 244, 238, 0.12);
}

html,
body {
  background: #080a09;
}

.room-view {
  background: #0d0f0e;
  color: rgba(242, 241, 233, 0.90);
}

.room-scroll,
.fragrance-room .room-scroll {
  background: #0d0f0e;
}

.room-head {
  border-bottom-color: rgba(244, 244, 238, 0.12);
  background: rgba(11, 13, 12, 0.90);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.22);
}

.room-head > p {
  color: rgba(242, 241, 233, 0.56);
}

.room-head .language button {
  color: rgba(242, 241, 233, 0.30);
}

.room-head .language button:hover,
.room-head .language button.is-active {
  color: rgba(248, 247, 240, 0.92);
}

.room-back {
  color: rgba(242, 241, 233, 0.48);
}

.room-group,
.room-note-title {
  color: rgba(242, 241, 233, 0.38);
}

.room-intro,
.room-note-body,
.room-note-quote p,
.room-footer button {
  color: rgba(242, 241, 233, 0.84);
}

.room-note-quote cite,
.room-image figcaption {
  color: rgba(242, 241, 233, 0.42);
}

.room-visit {
  border-bottom-color: rgba(242, 241, 233, 0.22);
  color: rgba(242, 241, 233, 0.60);
}

.room-visit:hover {
  color: rgba(250, 249, 242, 0.94);
  border-bottom-color: rgba(242, 241, 233, 0.60);
}

.room-notes,
.room-note,
.room-footer {
  border-color: rgba(244, 244, 238, 0.11);
}

/* Darker exhibition fields: still visibly grey, but no longer read as white panels. */
.room-view[data-group="collection"] .room-image {
  background: #2a2d2b;
  box-shadow:
    0 0 0 1px rgba(244, 244, 238, 0.075),
    0 28px 70px rgba(0, 0, 0, 0.16);
}

.room-view[data-room="seawater"] .room-image {
  background: #232624;
}

.room-view[data-group="collection"] .room-image figcaption {
  color: rgba(239, 238, 230, 0.43);
}

/* Keep the after-image visible against the darker plate without turning it neon. */
.room-view[data-group="collection"] .room-image::before {
  opacity: 0.48;
  filter: grayscale(1) brightness(0.72) blur(18px);
}

.room-view[data-room="seawater"] .room-image::before {
  display: none;
}

.seawater-caustics {
  opacity: 0.50;
  filter: grayscale(1) contrast(1.08) brightness(0.72) blur(4px);
}

/* Fragrance gallery follows the same dark editorial surface. */
.fragrance-gallery,
.fragrance-theme-nav {
  border-color: rgba(244, 244, 238, 0.11);
  background: #101211;
}

.fragrance-theme {
  border-right-color: rgba(244, 244, 238, 0.10);
  color: rgba(242, 241, 233, 0.46);
}

.fragrance-theme:hover,
.fragrance-theme.is-active {
  background: rgba(255, 255, 255, 0.055);
  color: rgba(248, 247, 240, 0.90);
}

.fragrance-theme-index,
.fragrance-theme-count {
  color: rgba(242, 241, 233, 0.28);
}

.fragrance-frame figcaption {
  color: rgba(242, 241, 233, 0.38);
}

.fragrance-arrow {
  color: rgba(242, 241, 233, 0.28);
}

.fragrance-arrow:hover {
  color: rgba(248, 247, 240, 0.88);
  background: rgba(255, 255, 255, 0.05);
}

.fragrance-thumb.is-active {
  border-color: rgba(242, 241, 233, 0.40);
}

@media (max-width: 760px) {
  .room-view[data-group="collection"] .room-image {
    box-shadow:
      0 0 0 1px rgba(244, 244, 238, 0.07),
      0 18px 44px rgba(0, 0, 0, 0.14);
  }

  .room-view[data-group="collection"] .room-image::before {
    opacity: 0.54;
    filter: grayscale(1) brightness(0.74) blur(14px);
  }

  .seawater-caustics {
    opacity: 0.54;
    filter: grayscale(1) contrast(1.08) brightness(0.76) blur(3px);
  }
}
'''

path.write_text(css.rstrip() + block + '\n', encoding='utf-8')
print('dark theme appended')
