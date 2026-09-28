from pathlib import Path

path = Path('style.css')
css = path.read_text(encoding='utf-8')

anchor = '''@media (prefers-reduced-motion: reduce) {
  .room-view[data-group="collection"] .room-image::before {
'''
if anchor not in css:
    raise SystemExit('collection reduced-motion anchor not found')

refinement = '''/*
  Collection editorial stage
  --------------------------
  Treat each grey field like a plate mounted on the page rather than a second
  viewport. Generous paper around the field gives the eye somewhere to rest and
  keeps the moving light subordinate to the artwork.
*/
@media (min-width: 761px) {
  .room-view[data-group="collection"] .room-image {
    width: min(72vw, 1120px);
    height: min(64svh, 680px);
    min-height: 480px;
    margin: clamp(7vh, 9vh, 96px) auto clamp(18vh, 22vh, 220px);
    padding: clamp(34px, 3.8vw, 56px) clamp(38px, 4.8vw, 68px) clamp(22px, 2.5vw, 32px);
    box-shadow: 0 0 0 1px rgba(23, 24, 19, 0.075);
  }

  .room-view[data-group="collection"] .room-image img,
  .room-view[data-group="collection"] .room-image.is-contain img {
    max-width: 88%;
    max-height: calc(100% - 38px);
  }

  .room-view[data-group="collection"] .room-image figcaption {
    width: 88%;
    justify-self: center;
    margin-top: 13px;
    color: rgba(23, 24, 19, 0.40);
    font-size: 8px;
    letter-spacing: 0.055em;
  }
}

@media (min-width: 1400px) {
  .room-view[data-group="collection"] .room-image {
    width: min(68vw, 1140px);
    height: min(62svh, 690px);
  }
}

@media (max-width: 760px) {
  .room-view[data-group="collection"] .room-image {
    width: calc(100vw - 38px);
    height: min(56svh, 520px);
    min-height: 350px;
    margin: 6vh auto 15vh;
    padding: 18px 16px 16px;
    box-shadow: 0 0 0 1px rgba(23, 24, 19, 0.07);
  }

  .room-view[data-group="collection"] .room-image img,
  .room-view[data-group="collection"] .room-image.is-contain img {
    max-width: 92%;
    max-height: calc(100% - 34px);
  }

  .room-view[data-group="collection"] .room-image figcaption {
    width: 92%;
    justify-self: center;
  }
}

'''

# Insert immediately before reduced-motion so it overrides the earlier generic room-image sizing.
css = css.replace(anchor, refinement + anchor, 1)
path.write_text(css, encoding='utf-8')
print('collection stage refined')
