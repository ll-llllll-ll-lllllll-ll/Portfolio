from pathlib import Path

p = Path('style.css')
css = p.read_text(encoding='utf-8')
old = '''.room-view[data-room="seawater"] .room-scroll {
  position: relative;
  z-index: 3;
  background: transparent;
}
'''
new = '''.room-view[data-room="seawater"] .room-scroll {
  position: absolute;
  inset: 54px 0 0;
  z-index: 3;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  touch-action: pan-y;
  background: transparent;
}
'''
if old not in css:
    raise SystemExit('target seawater room-scroll block not found')
css = css.replace(old, new, 1)
p.write_text(css, encoding='utf-8')
print('fixed seawater scroll container')
