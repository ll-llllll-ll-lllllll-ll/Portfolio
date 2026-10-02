from pathlib import Path
import re

script_path = Path('script.js')
style_path = Path('style.css')
index_path = Path('index.html')

js = script_path.read_text(encoding='utf-8')
css = style_path.read_text(encoding='utf-8')
html = index_path.read_text(encoding='utf-8')

new_function = r'''  function mountSeawaterWorld(item) {
    if (!item || item.slug !== "seawater") return;

    var room = document.querySelector('.room-view[data-room="seawater"]');
    if (!room) return;

    var scroll = room.querySelector(".room-scroll");
    if (!scroll || room.querySelector(".seawater-caustic-projection")) return;

    /* Remove legacy WebGL / shadow surfaces if a previous render path left them behind. */
    room.querySelectorAll(".seawater-world-light, .seawater-world-shadow, .seawater-caustics").forEach(function (node) {
      node.remove();
    });

    /*
      Canvas2D projected Water Caustics
      ---------------------------------
      Each artwork is treated as a shallow rectangular solid at virtual height z.
      Its four corners are projected from a 3D point light onto the page plane.
      The convex hull of the original and projected rectangles is the optical
      "shadow volume". Instead of filling that volume with black shadow, we fill
      it with the same low-resolution Canvas2D interference field used for the
      earlier Water Caustics experiments.
    */
    var canvas = document.createElement("canvas");
    canvas.className = "seawater-caustic-projection";
    canvas.setAttribute("aria-hidden", "true");
    room.insertBefore(canvas, scroll);

    var ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      canvas.remove();
      return;
    }

    var low = document.createElement("canvas");
    var lowCtx = low.getContext("2d", { alpha: true, willReadFrequently: false });
    if (!lowCtx) {
      canvas.remove();
      return;
    }

    var width = 1;
    var height = 1;
    var pixelRatio = 1;
    var lowWidth = 156;
    var lowHeight = 156;
    var lowImageData = null;
    var reduceMotion = false;
    var lastFrame = 0;
    var lastFieldFrame = -1;

    try {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {}

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function smoothstep(edge0, edge1, x) {
      var t = clamp((x - edge0) / Math.max(0.00001, edge1 - edge0), 0, 1);
      return t * t * (3 - 2 * t);
    }

    function scrollProgress() {
      var maxScroll = Math.max(1, scroll.scrollHeight - scroll.clientHeight);
      return clamp(scroll.scrollTop / maxScroll, 0, 1);
    }

    function lightForScroll() {
      var p = scrollProgress();
      /* screen-space: 9 o'clock -> 7 o'clock, only a restrained 60-degree arc */
      var theta = (180 - p * 60) * Math.PI / 180;
      var radius = Math.min(width, height) * (width <= 760 ? 0.43 : 0.47);
      return {
        x: width * 0.5 + Math.cos(theta) * radius,
        y: height * 0.52 + Math.sin(theta) * radius,
        z: width <= 760 ? 560 : 660,
        progress: p
      };
    }

    function cross(o, a, b) {
      return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    }

    function convexHull(points) {
      var pts = points.slice().sort(function (a, b) {
        return a.x === b.x ? a.y - b.y : a.x - b.x;
      });
      if (pts.length <= 2) return pts;

      var lower = [];
      pts.forEach(function (p) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
        lower.push(p);
      });

      var upper = [];
      for (var i = pts.length - 1; i >= 0; i -= 1) {
        var p = pts[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
        upper.push(p);
      }

      lower.pop();
      upper.pop();
      return lower.concat(upper);
    }

    function projectRect(rect, light, elevation, canvasRect) {
      var left = rect.left - canvasRect.left;
      var right = rect.right - canvasRect.left;
      var top = rect.top - canvasRect.top;
      var bottom = rect.bottom - canvasRect.top;
      var base = [
        { x: left, y: top },
        { x: right, y: top },
        { x: right, y: bottom },
        { x: left, y: bottom }
      ];
      var projection = light.z / Math.max(1, light.z - elevation);
      var projected = base.map(function (point) {
        return {
          x: light.x + (point.x - light.x) * projection,
          y: light.y + (point.y - light.y) * projection
        };
      });
      return { base: base, projected: projected };
    }

    function hullPath(hull) {
      if (!hull.length) return;
      ctx.beginPath();
      ctx.moveTo(hull[0].x, hull[0].y);
      for (var i = 1; i < hull.length; i += 1) ctx.lineTo(hull[i].x, hull[i].y);
      ctx.closePath();
    }

    function resizeWorld() {
      var rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      var mobile = width <= 760;

      /* Keep the final surface crisp, but do the expensive optical field at low resolution. */
      pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.2 : 1.35);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      lowWidth = mobile ? 126 : 168;
      lowHeight = Math.round(lowWidth * Math.max(0.72, Math.min(1.15, height / Math.max(width, 1))));
      low.width = lowWidth;
      low.height = lowHeight;
      lowCtx.imageSmoothingEnabled = true;
      lowCtx.imageSmoothingQuality = "high";
      lowImageData = lowCtx.createImageData(lowWidth, lowHeight);
      lastFieldFrame = -1;
    }

    function renderLowField(timeSeconds) {
      if (!lowImageData) return;
      var data = lowImageData.data;
      var time = reduceMotion ? 0 : timeSeconds;
      var pointer = 0;

      for (var y = 0; y < lowHeight; y += 1) {
        var ny = (y + 0.5) / lowHeight - 0.5;
        for (var x = 0; x < lowWidth; x += 1) {
          var nx = (x + 0.5) / lowWidth - 0.5;

          /* Multi-field interference: irregular connected bright caustic ridges. */
          var wx = nx + 0.085 * Math.sin(ny * 12.5 + time * 1.46) + 0.034 * Math.sin(ny * 25.0 - time * 1.08 + 0.7);
          var wy = ny + 0.082 * Math.cos(nx * 11.2 - time * 1.28) + 0.030 * Math.cos(nx * 22.4 + time * 0.92 + 1.3);

          var a = Math.sin(wx * 18.0 + Math.sin(wy * 10.5 + time * 1.18));
          var b = Math.cos(wy * 17.0 + Math.sin(wx * 11.5 - time * 1.02));
          var c = Math.sin((wx + wy) * 12.2 + Math.cos((wx - wy) * 9.7 + time * 0.84));
          var d = Math.cos((wx - wy) * 14.3 + Math.sin(wy * 8.6 - time * 0.72));
          var f = (a + b + c + d) * 0.25;

          var ridge = Math.max(0, 1 - Math.abs(f) * 1.64);
          var core = Math.pow(ridge, 8.5);
          var halo = Math.pow(Math.max(0, 1 - Math.abs(f) * 1.02), 2.7) * 0.18;
          var crossField = Math.sin(wx * 13.5 + Math.sin(wy * 18.0 + time * 0.82)) * 0.55 +
            Math.cos(wy * 14.8 + Math.sin(wx * 16.0 - time * 0.88)) * 0.45;
          var crossing = Math.pow(Math.max(0, 1 - Math.abs(crossField) * 1.48), 7.2) * 0.28;
          var value = clamp(core * 1.08 + halo + crossing, 0, 1);

          /* transparent background, warm-white caustic light only */
          data[pointer] = 255;
          data[pointer + 1] = 254;
          data[pointer + 2] = 246;
          data[pointer + 3] = Math.round(value * 235);
          pointer += 4;
        }
      }

      lowCtx.putImageData(lowImageData, 0, 0);
    }

    function drawProjectedCaustic(rect, index, light, canvasRect) {
      if (rect.width < 2 || rect.height < 2) return;

      var mobile = width <= 760;
      var elevation = clamp(
        rect.width * (index === 0 ? 0.43 : 0.38),
        mobile ? 86 : 118,
        mobile ? 190 : 260
      );
      var geom = projectRect(rect, light, elevation, canvasRect);
      var hull = convexHull(geom.base.concat(geom.projected));
      if (hull.length < 3) return;

      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      hull.forEach(function (p) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });

      var baseCenter = {
        x: (geom.base[0].x + geom.base[2].x) * 0.5,
        y: (geom.base[0].y + geom.base[2].y) * 0.5
      };
      var projectedCenter = {
        x: (geom.projected[0].x + geom.projected[2].x) * 0.5,
        y: (geom.projected[0].y + geom.projected[2].y) * 0.5
      };

      ctx.save();
      hullPath(hull);
      ctx.clip();

      /* A translucent optical volume makes white caustics legible on the warm-white page. */
      var volume = ctx.createLinearGradient(baseCenter.x, baseCenter.y, projectedCenter.x, projectedCenter.y);
      volume.addColorStop(0, "rgba(116, 114, 104, 0.16)");
      volume.addColorStop(0.52, "rgba(126, 124, 114, 0.13)");
      volume.addColorStop(1, "rgba(132, 130, 120, 0.07)");
      ctx.fillStyle = volume;
      ctx.fillRect(minX - 4, minY - 4, maxX - minX + 8, maxY - minY + 8);

      /* Draw the low-res caustic field enlarged into the projected hull. */
      ctx.globalAlpha = index === 0 ? 0.92 : 0.88;
      ctx.globalCompositeOperation = "source-over";
      ctx.filter = mobile ? "blur(1.0px) contrast(1.22)" : "blur(1.25px) contrast(1.28)";
      ctx.drawImage(low, minX - 18, minY - 18, (maxX - minX) + 36, (maxY - minY) + 36);

      /* A softer second pass gives the bright cores a natural optical bloom. */
      ctx.globalAlpha = 0.28;
      ctx.filter = mobile ? "blur(3.4px)" : "blur(4.2px)";
      ctx.drawImage(low, minX - 18, minY - 18, (maxX - minX) + 36, (maxY - minY) + 36);
      ctx.restore();
    }

    function render(now) {
      if (!canvas.isConnected) return;
      var mobile = width <= 760;
      var frameInterval = mobile ? 50 : 38; /* ~20fps mobile / ~26fps desktop */

      if (now - lastFrame >= frameInterval || reduceMotion && lastFieldFrame < 0) {
        lastFrame = now;
        var fieldFrame = Math.floor(now / frameInterval);
        if (fieldFrame !== lastFieldFrame) {
          renderLowField(now * 0.00135);
          lastFieldFrame = fieldFrame;
        }

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.clearRect(0, 0, width, height);

        var canvasRect = canvas.getBoundingClientRect();
        var images = Array.prototype.slice.call(scroll.querySelectorAll(".room-image img")).slice(0, 2);
        var light = lightForScroll();
        var anyVisible = false;

        images.forEach(function (image, index) {
          var rect = image.getBoundingClientRect();
          if (rect.bottom < canvasRect.top - height * 0.75 || rect.top > canvasRect.bottom + height * 0.75) return;
          anyVisible = true;
          drawProjectedCaustic(rect, index, light, canvasRect);
        });

        canvas.style.opacity = anyVisible ? "1" : "0";
        document.documentElement.dataset.seawaterRenderer = "canvas2d-projected-caustics";
      }

      requestAnimationFrame(render);
    }

    scroll.addEventListener("scroll", function () {}, { passive: true });
    window.addEventListener("resize", resizeWorld, { passive: true });
    window.addEventListener("orientationchange", resizeWorld, { passive: true });

    scroll.querySelectorAll(".room-image img").forEach(function (image) {
      if (!image.complete) image.addEventListener("load", resizeWorld, { once: true });
    });

    resizeWorld();
    requestAnimationFrame(render);
  }
'''

pattern = re.compile(r'  function mountSeawaterWorld\(item\) \{.*?\n  \}\n\n\n  var collectionStageResizeFrame', re.S)
if not pattern.search(js):
    pattern = re.compile(r'  function mountSeawaterWorld\(item\) \{.*?\n  \}\n\n  var collectionStageResizeFrame', re.S)
if not pattern.search(js):
    raise SystemExit('mountSeawaterWorld block not found')
js = pattern.sub(lambda _m: new_function + '\n\n  var collectionStageResizeFrame', js, count=1)

marker = '/* ===== Seawater Canvas2D projected caustic volumes ===== */'
if marker not in css:
    css += r'''

/* ===== Seawater Canvas2D projected caustic volumes ===== */
.room-view[data-room="seawater"] {
  background: #f4f3ee;
}

.room-view[data-room="seawater"] .seawater-world-light,
.room-view[data-room="seawater"] .seawater-world-shadow,
.room-view[data-room="seawater"] .seawater-caustics {
  display: none !important;
}

.room-view[data-room="seawater"] .seawater-caustic-projection {
  position: absolute;
  top: 54px;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: calc(100% - 54px);
  pointer-events: none;
  opacity: 0;
  transition: opacity 260ms ease;
  background: transparent !important;
  image-rendering: auto;
}

.room-view[data-room="seawater"] .room-scroll {
  position: absolute;
  inset: 54px 0 0;
  z-index: 3;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  touch-action: pan-y;
  background: transparent;
}

.room-view[data-room="seawater"] .room-image,
.room-view[data-room="seawater"] .room-image.is-contain {
  overflow: visible;
  isolation: auto;
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.room-view[data-room="seawater"] .room-image::before,
.room-view[data-room="seawater"] .room-image::after {
  display: none !important;
}

.room-view[data-room="seawater"] .room-image img,
.room-view[data-room="seawater"] .room-image.is-contain img {
  position: relative;
  z-index: 4;
  background: transparent;
  border-radius: 0 !important;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.34);
}

.room-view[data-room="seawater"] .room-image figcaption {
  position: absolute;
  z-index: 5;
}

.room-view[data-room="seawater"] .room-lead,
.room-view[data-room="seawater"] .room-notes,
.room-view[data-room="seawater"] .room-footer {
  position: relative;
  z-index: 4;
}

@media (max-width: 760px) {
  .room-view[data-room="seawater"] .seawater-caustic-projection {
    transition-duration: 180ms;
  }
}
'''

# force GitHub Pages/browser cache refresh
stamp = '20261002-1625'
html = re.sub(r'href="\.\/style\.css(?:\?v=[^"]+)?"', f'href="./style.css?v={stamp}"', html)
html = re.sub(r'src="\.\/calendar\/library\.js(?:\?v=[^"]+)?"', f'src="./calendar/library.js?v={stamp}"', html)
html = re.sub(r'src="\.\/script\.js(?:\?v=[^"]+)?"', f'src="./script.js?v={stamp}"', html)

script_path.write_text(js, encoding='utf-8')
style_path.write_text(css, encoding='utf-8')
index_path.write_text(html, encoding='utf-8')
print('installed Canvas2D projected Water Caustics renderer')
