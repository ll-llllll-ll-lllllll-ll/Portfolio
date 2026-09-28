from pathlib import Path

path = Path('style.css')
css = path.read_text(encoding='utf-8')

old_generic = '''  filter: grayscale(1) blur(18px);
  transform-origin: 50% 50%;
  transform: scale(1.14) translate3d(-9%, -4%, 0) rotate(-1.2deg);
  animation: collection-afterimage 9s cubic-bezier(.42, 0, .25, 1) infinite alternate;
'''
new_generic = '''  filter: grayscale(1) blur(24px);
  transform-origin: 50% 50%;
  transform: scale(1.22) rotate(0deg) translate3d(8%, 0, 0);
  animation: collection-afterimage-orbit 32s linear infinite, collection-afterimage-breathe 16s ease-in-out infinite alternate;
'''
if old_generic not in css:
    raise SystemExit('generic afterimage block not found')
css = css.replace(old_generic, new_generic, 1)

start = css.index('@keyframes collection-afterimage {')
end = css.index('@media (max-width: 760px) {', start)
smooth_keys = '''@keyframes collection-afterimage-orbit {
  from {
    transform: scale(1.22) rotate(0deg) translate3d(8%, 0, 0);
  }
  to {
    transform: scale(1.22) rotate(360deg) translate3d(8%, 0, 0);
  }
}

@keyframes collection-afterimage-breathe {
  from { opacity: 0.48; }
  to { opacity: 0.68; }
}

'''
css = css[:start] + smooth_keys + css[end:]

old_mobile = '''    opacity: 0.62;
    filter: grayscale(1) blur(14px);
    animation-duration: 8s;
'''
new_mobile = '''    opacity: 0.62;
    filter: grayscale(1) blur(18px);
    animation: collection-afterimage-orbit 27s linear infinite, collection-afterimage-breathe 14s ease-in-out infinite alternate;
'''
if old_mobile not in css:
    raise SystemExit('mobile afterimage block not found')
css = css.replace(old_mobile, new_mobile, 1)

marker = '@media (prefers-reduced-motion: reduce) {'
insert_at = css.index(marker, css.index('Collection after-image field'))
seawater = '''/* Seawater collection — very slow travelling sunlight. */
.room-view[data-room="seawater"] .room-image::after {
  z-index: 2;
  inset: -10%;
  opacity: 0.42;
  background-image: radial-gradient(circle, rgba(255,255,248,.78) 0 5%, rgba(238,238,228,.46) 16%, rgba(207,207,198,.20) 31%, transparent 56%);
  background-size: 50% 50%;
  background-repeat: no-repeat;
  background-position: 50% 0%;
  mix-blend-mode: screen;
  filter: grayscale(1) blur(26px);
  animation: seawater-sun-orbit 88s linear infinite;
  will-change: background-position;
}

.room-view[data-room="seawater"] .room-image img {
  animation: seawater-cast-shadow 88s linear infinite;
  will-change: box-shadow;
}

@keyframes seawater-sun-orbit {
  0% { background-position: 50% 0%; }
  12.5% { background-position: 82% 10%; }
  25% { background-position: 100% 50%; }
  37.5% { background-position: 82% 90%; }
  50% { background-position: 50% 100%; }
  62.5% { background-position: 18% 90%; }
  75% { background-position: 0% 50%; }
  87.5% { background-position: 18% 10%; }
  100% { background-position: 50% 0%; }
}

@keyframes seawater-cast-shadow {
  0% { box-shadow: 0 18px 28px 5px rgba(0,0,0,.16), 0 34px 60px 14px rgba(0,0,0,.085); }
  12.5% { box-shadow: -13px 13px 30px 6px rgba(0,0,0,.16), -27px 27px 62px 15px rgba(0,0,0,.085); }
  25% { box-shadow: -18px 0 28px 5px rgba(0,0,0,.16), -34px 0 60px 14px rgba(0,0,0,.085); }
  37.5% { box-shadow: -13px -13px 30px 6px rgba(0,0,0,.16), -27px -27px 62px 15px rgba(0,0,0,.085); }
  50% { box-shadow: 0 -18px 28px 5px rgba(0,0,0,.16), 0 -34px 60px 14px rgba(0,0,0,.085); }
  62.5% { box-shadow: 13px -13px 30px 6px rgba(0,0,0,.16), 27px -27px 62px 15px rgba(0,0,0,.085); }
  75% { box-shadow: 18px 0 28px 5px rgba(0,0,0,.16), 34px 0 60px 14px rgba(0,0,0,.085); }
  87.5% { box-shadow: 13px 13px 30px 6px rgba(0,0,0,.16), 27px 27px 62px 15px rgba(0,0,0,.085); }
  100% { box-shadow: 0 18px 28px 5px rgba(0,0,0,.16), 0 34px 60px 14px rgba(0,0,0,.085); }
}

@media (max-width: 760px) {
  .room-view[data-room="seawater"] .room-image::after {
    opacity: 0.46;
    filter: grayscale(1) blur(22px);
    animation-duration: 96s;
  }

  .room-view[data-room="seawater"] .room-image img {
    animation-duration: 96s;
  }
}

'''
css = css[:insert_at] + seawater + css[insert_at:]

path.write_text(css, encoding='utf-8')
print('collection motion refined')
