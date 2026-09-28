from pathlib import Path
import re

style_path = Path('style.css')
css = style_path.read_text(encoding='utf-8')

# 1) Restore the pre-orbit visual character of the generated light sheet, but make
#    its path a dense, linear, closed loop so it never visibly eases to a stop.
css = css.replace(
'''  filter: grayscale(1) blur(24px);
  transform-origin: 50% 50%;
  transform: scale(1.22) rotate(0deg) translate3d(8%, 0, 0);
  animation: collection-afterimage-orbit 32s linear infinite, collection-afterimage-breathe 16s ease-in-out infinite alternate;
''',
'''  filter: grayscale(1) blur(18px);
  transform-origin: 50% 50%;
  transform: scale(1.18) translate3d(-7%, -2%, 0);
  animation: collection-afterimage-flow 26s linear infinite, collection-afterimage-breathe 17s ease-in-out infinite alternate;
''', 1)

start = css.index('@keyframes collection-afterimage-orbit {')
end = css.index('@media (max-width: 760px) {', start)
new_keys = '''@keyframes collection-afterimage-flow {
  0%     { transform: scale(1.18) translate3d(-7.0%, -2.0%, 0); }
  6.25%  { transform: scale(1.18) translate3d(-6.5%, -3.7%, 0); }
  12.5%  { transform: scale(1.18) translate3d(-5.3%, -5.1%, 0); }
  18.75% { transform: scale(1.18) translate3d(-3.2%, -6.0%, 0); }
  25%    { transform: scale(1.18) translate3d(-0.5%, -6.4%, 0); }
  31.25% { transform: scale(1.18) translate3d(2.2%, -6.0%, 0); }
  37.5%  { transform: scale(1.18) translate3d(4.8%, -4.8%, 0); }
  43.75% { transform: scale(1.18) translate3d(6.5%, -2.8%, 0); }
  50%    { transform: scale(1.18) translate3d(7.2%, -0.2%, 0); }
  56.25% { transform: scale(1.18) translate3d(6.5%, 2.5%, 0); }
  62.5%  { transform: scale(1.18) translate3d(5.0%, 4.6%, 0); }
  68.75% { transform: scale(1.18) translate3d(2.6%, 5.8%, 0); }
  75%    { transform: scale(1.18) translate3d(0%, 6.4%, 0); }
  81.25% { transform: scale(1.18) translate3d(-2.8%, 5.8%, 0); }
  87.5%  { transform: scale(1.18) translate3d(-5.2%, 4.3%, 0); }
  93.75% { transform: scale(1.18) translate3d(-6.7%, 1.8%, 0); }
  100%   { transform: scale(1.18) translate3d(-7.0%, -2.0%, 0); }
}

@keyframes collection-afterimage-breathe {
  from { opacity: 0.48; }
  to { opacity: 0.64; }
}

'''
css = css[:start] + new_keys + css[end:]

css = css.replace(
'''    opacity: 0.62;
    filter: grayscale(1) blur(18px);
    animation: collection-afterimage-orbit 27s linear infinite, collection-afterimage-breathe 14s ease-in-out infinite alternate;
''',
'''    opacity: 0.60;
    filter: grayscale(1) blur(14px);
    animation: collection-afterimage-flow 23s linear infinite, collection-afterimage-breathe 15s ease-in-out infinite alternate;
''', 1)

# 2) Remove the previous experimental circular sunlight + animated box-shadow block.
marker = '/* Seawater collection — very slow travelling sunlight. */'
if marker in css:
    s = css.index(marker)
    e = css.index('@media (prefers-reduced-motion: reduce) {', s)
    css = css[:s] + css[e:]

# 3) Remove now-dead legacy ripple CSS, if still present.
css = re.sub(r'\n\s*\.room-image-ripple \{.*?\n\s*\}\n\n\s*\.room-image-ripple-veil \{.*?\n\s*\}\n', '\n', css, flags=re.S)
css = re.sub(r'\n\s*\.room-image-ripple \{\n\s*display: block;\n\s*\}\n', '\n', css)

# 4) Seawater gets a separate procedural caustics canvas instead of the generic sheet.
insert_at = css.index('@media (prefers-reduced-motion: reduce) {', css.index('Collection after-image field'))
caustics_css = '''/*
  Seawater collection — procedural water caustics
  ------------------------------------------------
  These two grey stages replace the generic drifting light sheet with a small
  low-resolution Canvas 2D light field. CSS enlarges and softens it so the result
  reads as projected water-caustic light rather than a literal water surface.
*/
.room-view[data-room="seawater"] .room-image {
  background: #686865;
}

.room-view[data-room="seawater"] .room-image::before {
  display: none;
}

.room-view[data-room="seawater"] .room-image::after {
  z-index: 1;
  opacity: 0.045;
}

.seawater-caustics {
  position: absolute;
  z-index: 0;
  inset: -5%;
  width: 110%;
  height: 110%;
  pointer-events: none;
  opacity: 0.58;
  mix-blend-mode: screen;
  filter: grayscale(1) contrast(1.12) brightness(0.82) blur(4px);
  transform: scale(1.03);
}

@media (max-width: 760px) {
  .seawater-caustics {
    inset: -7%;
    width: 114%;
    height: 114%;
    opacity: 0.62;
    filter: grayscale(1) contrast(1.10) brightness(0.84) blur(3px);
  }
}

'''
css = css[:insert_at] + caustics_css + css[insert_at:]
style_path.write_text(css, encoding='utf-8')

script_path = Path('script.js')
js = script_path.read_text(encoding='utf-8')

# Remove the old, now-unused room-by-the-lake external ripple-video function.
if '  function addRippleHallucination(item) {' in js:
    s = js.index('  function addRippleHallucination(item) {')
    e = js.index('  function refineCurrentView() {', s)
    js = js[:s] + js[e:]

# Remove the dead ripple retry lines from the shared gesture handler.
js = js.replace('''    var rippleVideo = document.querySelector(".room-image-ripple");
    if (rippleVideo) tryPlayVideo(rippleVideo);
''', '')

# Insert procedural caustics renderer immediately before refineCurrentView.
needle = '  function refineCurrentView() {'
if needle not in js:
    raise SystemExit('refineCurrentView marker not found')
renderer = r'''  function mountSeawaterCaustics(item) {
    if (!item || item.slug !== "seawater") return;

    var frames = document.querySelectorAll('.room-view[data-room="seawater"] .room-image');
    if (!frames.length) return;

    var reduceMotion = false;
    try {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {}

    frames.forEach(function (frame, frameIndex) {
      if (frame.querySelector(".seawater-caustics")) return;

      var canvas = document.createElement("canvas");
      canvas.className = "seawater-caustics";
      canvas.width = 112;
      canvas.height = 84;
      canvas.setAttribute("aria-hidden", "true");
      frame.insertBefore(canvas, frame.firstChild);

      var ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;

      var image = ctx.createImageData(canvas.width, canvas.height);
      var pixels = image.data;
      var xs = new Float32Array(canvas.width);
      var ys = new Float32Array(canvas.height);
      var aspect = canvas.width / canvas.height;
      var scale = 8.8;
      var x, y;

      for (x = 0; x < canvas.width; x += 1) {
        xs[x] = (x / (canvas.width - 1) - 0.5) * aspect * scale;
      }
      for (y = 0; y < canvas.height; y += 1) {
        ys[y] = (y / (canvas.height - 1) - 0.5) * scale;
      }

      var visible = true;
      var startTime = performance.now();
      var lastDraw = 0;
      var phase = frameIndex * 4.1;

      if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            visible = entry.isIntersecting && entry.intersectionRatio > 0.02;
          });
        }, { threshold: [0, 0.02, 0.2] });
        observer.observe(frame);
      }

      function renderCaustics(now) {
        if (!canvas.isConnected) return;

        if (visible && (reduceMotion || now - lastDraw >= 40)) {
          lastDraw = now;
          var t = phase + (now - startTime) * 0.00034;
          var p = 0;

          for (y = 0; y < canvas.height; y += 1) {
            var v = ys[y];
            for (x = 0; x < canvas.width; x += 1) {
              var u = xs[x];
              var qx = u + 0.32 * Math.sin(v * 1.25 + t * 0.42) + 0.16 * Math.sin(v * 2.15 - t * 0.26 + 1.1);
              var qy = v + 0.32 * Math.cos(u * 1.18 - t * 0.35) + 0.16 * Math.cos(u * 2.05 + t * 0.24);
              var a = Math.sin(qx * 1.95 + Math.sin(qy * 1.55 + t * 0.38));
              var b = Math.cos(qy * 2.05 + Math.sin(qx * 1.35 - t * 0.31));
              var c = Math.sin((qx + qy) * 1.25 + Math.cos((qx - qy) * 1.45 + t * 0.24));
              var d = Math.cos((qx - qy) * 1.62 + Math.sin(qy * 1.0 - t * 0.20));
              var f = (a + b + c + d) * 0.25;
              var line = Math.max(0, 1 - Math.abs(f) * 1.52);
              line = Math.pow(line, 6.2);

              var f2 = Math.sin(qx * 1.37 + Math.sin(qy * 2.15 - t * 0.19)) * 0.55 +
                Math.cos(qy * 1.42 + Math.sin(qx * 1.9 + t * 0.17)) * 0.45;
              var line2 = Math.max(0, 1 - Math.abs(f2) * 1.20);
              line2 = Math.pow(line2, 7.5) * 0.28;

              var light = Math.min(1, line + line2);
              var alpha = Math.round(light * 188);
              pixels[p] = 255;
              pixels[p + 1] = 255;
              pixels[p + 2] = 248;
              pixels[p + 3] = alpha;
              p += 4;
            }
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.putImageData(image, 0, 0);
          if (reduceMotion) return;
        }

        requestAnimationFrame(renderCaustics);
      }

      requestAnimationFrame(renderCaustics);
    });
  }

'''
js = js.replace(needle, renderer + needle, 1)

# Call it after room/group data attributes are present.
call_needle = '''    roomView.dataset.group = item.group;
    updateFooterNavigation(item);
'''
if call_needle not in js:
    raise SystemExit('refineCurrentView body marker not found')
js = js.replace(call_needle, '''    roomView.dataset.group = item.group;
    updateFooterNavigation(item);
    mountSeawaterCaustics(item);
''', 1)

script_path.write_text(js, encoding='utf-8')
print('smooth collection flow + procedural seawater caustics applied')
