from pathlib import Path

script_path = Path('script.js')
js = script_path.read_text(encoding='utf-8')

start = js.find('  function mountSeawaterCaustics(item) {')
end = js.find('\n  var collectionStageResizeFrame = 0;', start)
if start < 0 or end < 0:
    raise SystemExit('old seawater caustics block not found')

new_block = r'''  function mountSeawaterWorld(item) {
    if (!item || item.slug !== "seawater") return;

    var room = document.querySelector('.room-view[data-room="seawater"]');
    if (!room) return;

    var scroll = room.querySelector(".room-scroll");
    if (!scroll || room.querySelector(".seawater-world-light")) return;

    var canvas = document.createElement("canvas");
    canvas.className = "seawater-world-light";
    canvas.setAttribute("aria-hidden", "true");
    room.insertBefore(canvas, scroll);

    var ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    var low = document.createElement("canvas");
    var lowCtx = low.getContext("2d", { alpha: true, willReadFrequently: true });
    if (!lowCtx) return;

    var reduceMotion = false;
    try {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {}

    var width = 0;
    var height = 0;
    var ratio = 1;
    var lowWidth = 150;
    var lowHeight = 220;
    var imageData = null;
    var pixels = null;
    var lastFieldDraw = 0;
    var lastFrameDraw = 0;
    var scheduled = false;
    var active = false;

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function smoothstep(min, max, value) {
      var x = clamp((value - min) / (max - min), 0, 1);
      return x * x * (3 - 2 * x);
    }

    function scrollProgress() {
      var maxScroll = Math.max(1, scroll.scrollHeight - scroll.clientHeight);
      return clamp(scroll.scrollTop / maxScroll, 0, 1);
    }

    function resizeWorld() {
      var rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      var mobile = width <= 760;

      ratio = Math.min(window.devicePixelRatio || 1, mobile ? 1.2 : 1.5);
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      lowWidth = mobile ? 112 : 164;
      lowHeight = Math.max(120, Math.round(lowWidth * height / width));
      low.width = lowWidth;
      low.height = lowHeight;
      imageData = lowCtx.createImageData(lowWidth, lowHeight);
      pixels = imageData.data;

      scheduleWorld(true);
    }

    function lightForScroll() {
      var p = scrollProgress();
      var theta = (134 + p * 302) * Math.PI / 180;
      var radius = Math.min(width, height) * (width <= 760 ? 0.67 : 0.63);

      return {
        x: width * 0.5 + Math.cos(theta) * radius,
        y: height * 0.50 + Math.sin(theta) * radius,
        z: width <= 760 ? 540 : 700,
        progress: p
      };
    }

    function corridorIsVisible() {
      var images = scroll.querySelectorAll(".room-image img");
      if (!images.length) return false;

      var canvasRect = canvas.getBoundingClientRect();
      var first = images[0].getBoundingClientRect();
      var last = images[images.length - 1].getBoundingClientRect();
      var padding = height * 0.65;

      return first.top < canvasRect.bottom + padding && last.bottom > canvasRect.top - padding;
    }

    function renderCausticField(light, now) {
      if (!pixels || !imageData) return;

      var centerX = width * 0.5;
      var centerY = height * 0.5;
      var dirX = centerX - light.x;
      var dirY = centerY - light.y;
      var dirLength = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
      var ndx = dirX / dirLength;
      var ndy = dirY / dirLength;
      var phase = scroll.scrollTop * 0.0022 + (reduceMotion ? 0 : now * 0.00011);
      var pointer = 0;
      var x, y;

      for (y = 0; y < lowHeight; y += 1) {
        var sy = (y + 0.5) / lowHeight * height;

        for (x = 0; x < lowWidth; x += 1) {
          var sx = (x + 0.5) / lowWidth * width;
          var vx = sx - light.x;
          var vy = sy - light.y;
          var distance = Math.sqrt(vx * vx + vy * vy) + 0.0001;
          var dot = (vx * ndx + vy * ndy) / distance;
          var cone = smoothstep(-0.16, 0.58, dot);

          /*
            Point-source perspective: the pattern expands as it moves away from
            the source, so the caustic cells are tighter near the source and
            broader / softer in the distance rather than behaving like parallel light.
          */
          var perspective = 1 + distance / (width <= 760 ? 760 : 980);
          var u = vx / (64 * perspective);
          var v = vy / (64 * perspective);
          var qx = u + 0.28 * Math.sin(v * 1.35 + phase * 0.35) +
            0.12 * Math.sin(v * 2.40 - phase * 0.18 + 1.2);
          var qy = v + 0.28 * Math.cos(u * 1.25 - phase * 0.28) +
            0.12 * Math.cos(u * 2.15 + phase * 0.16);
          var a = Math.sin(qx * 2.0 + Math.sin(qy * 1.55 + phase * 0.22));
          var b = Math.cos(qy * 2.05 + Math.sin(qx * 1.40 - phase * 0.18));
          var c = Math.sin((qx + qy) * 1.22 + Math.cos((qx - qy) * 1.42 + phase * 0.14));
          var f = (a + b + c) / 3;
          var line = Math.max(0, 1 - Math.abs(f) * 1.50);

          /* Farther projected light has thicker / softer edges. */
          var sharpness = 7.6 - 3.1 * clamp(distance / 1400, 0, 1);
          line = Math.pow(line, sharpness);

          var falloff = 0.94 - 0.34 * clamp(distance / 1650, 0, 1);
          var value = clamp(line * cone * falloff, 0, 1);
          var alpha = Math.round(value * 210);

          pixels[pointer] = 242;
          pixels[pointer + 1] = 242;
          pixels[pointer + 2] = 233;
          pixels[pointer + 3] = alpha;
          pointer += 4;
        }
      }

      lowCtx.putImageData(imageData, 0, 0);
    }

    function convexHull(points) {
      if (points.length <= 1) return points.slice();

      var sorted = points.slice().sort(function (a, b) {
        return a.x === b.x ? a.y - b.y : a.x - b.x;
      });

      function cross(o, a, b) {
        return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
      }

      var lower = [];
      sorted.forEach(function (point) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
          lower.pop();
        }
        lower.push(point);
      });

      var upper = [];
      for (var i = sorted.length - 1; i >= 0; i -= 1) {
        var point = sorted[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
          upper.pop();
        }
        upper.push(point);
      }

      lower.pop();
      upper.pop();
      return lower.concat(upper);
    }

    function shadowHull(rect, light, elevation, offsetX, offsetY, canvasRect) {
      var sourceX = light.x + (offsetX || 0);
      var sourceY = light.y + (offsetY || 0);
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
          x: sourceX + (point.x - sourceX) * projection,
          y: sourceY + (point.y - sourceY) * projection
        };
      });

      /*
        The base rectangle plus its point-light projection is the silhouette of a
        shallow 3D block. Their convex hull gives the directional cast-shadow wedge.
      */
      return convexHull(base.concat(projected));
    }

    function fillHull(points, alpha) {
      if (!points.length) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      points.forEach(function (point, index) {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function renderShadows(light) {
      var canvasRect = canvas.getBoundingClientRect();
      var images = scroll.querySelectorAll(".room-image img");
      var mobile = width <= 760;

      images.forEach(function (image, index) {
        var rect = image.getBoundingClientRect();
        if (rect.bottom < canvasRect.top - height * 0.4 || rect.top > canvasRect.bottom + height * 0.4) return;

        var elevation = clamp(rect.width * (index === 0 ? 0.31 : 0.27), mobile ? 66 : 88, mobile ? 126 : 176);
        var areaRadius = mobile ? 22 : (index === 0 ? 34 : 39);

        /* Hard umbra from the centre of the source. */
        fillHull(shadowHull(rect, light, elevation, 0, 0, canvasRect), 0.44);

        /*
          Sample a small disk-shaped area light. The image/base edge is shared by
          every sample while only the far projected edge fans out, producing the
          requested near-crisp / far-soft penumbra without a uniform CSS blur.
        */
        var samples = mobile ? 18 : 30;
        var goldenAngle = 2.399963229728653;
        for (var i = 0; i < samples; i += 1) {
          var angle = i * goldenAngle;
          var radius = areaRadius * Math.sqrt((i + 0.5) / samples);
          fillHull(
            shadowHull(
              rect,
              light,
              elevation,
              Math.cos(angle) * radius,
              Math.sin(angle) * radius,
              canvasRect
            ),
            mobile ? 0.022 : 0.018
          );
        }
      });
    }

    function drawWorld(now, forceField) {
      if (!canvas.isConnected || !width || !height) return;

      active = corridorIsVisible();
      canvas.style.opacity = active ? "1" : "0";
      if (!active) return;

      var light = lightForScroll();
      var fieldInterval = width <= 760 ? 58 : 46;
      if (forceField || now - lastFieldDraw >= fieldInterval) {
        lastFieldDraw = now;
        renderCausticField(light, now);
      }

      ctx.save();
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#070807";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = width <= 760 ? 0.78 : 0.74;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(low, 0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      renderShadows(light);
      ctx.restore();
    }

    function scheduleWorld(forceField) {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function (now) {
        scheduled = false;
        drawWorld(now, !!forceField);
      });
    }

    function idleLoop(now) {
      if (!canvas.isConnected) return;
      var interval = width <= 760 ? 72 : 58;
      if (!reduceMotion && now - lastFrameDraw >= interval) {
        lastFrameDraw = now;
        scheduleWorld(false);
      }
      requestAnimationFrame(idleLoop);
    }

    scroll.addEventListener("scroll", function () {
      scheduleWorld(true);
    }, { passive: true });
    window.addEventListener("resize", resizeWorld, { passive: true });
    window.addEventListener("orientationchange", resizeWorld, { passive: true });

    resizeWorld();
    requestAnimationFrame(idleLoop);
  }

'''

js = js[:start] + new_block + js[end:]
js = js.replace('    mountSeawaterCaustics(item);', '    mountSeawaterWorld(item);', 1)
script_path.write_text(js, encoding='utf-8')

style_path = Path('style.css')
css = style_path.read_text(encoding='utf-8')
marker = '/* ===== Seawater long-space light world ===== */'
if marker in css:
    raise SystemExit('seawater long-space CSS already present')

css += r'''

/* ===== Seawater long-space light world ===== */
/*
  The two seawater works now occupy one continuous dark optical space rather than
  two isolated grey plates. A viewport canvas underneath the scroll layer renders
  perspective caustics and physically-derived cast shadows from the image blocks.
*/
.room-view[data-room="seawater"] {
  background: #070807;
}

.room-view[data-room="seawater"] .room-scroll {
  z-index: 2;
  background: transparent;
}

.seawater-world-light {
  position: absolute;
  z-index: 1;
  top: 54px;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: calc(100% - 54px);
  pointer-events: none;
  opacity: 0;
  background: #070807;
  transition: opacity 620ms ease;
}

/* The old per-image plate disappears only for this collection. Its dimensions are
   still retained as spatial intervals in the long page, so the images keep air. */
.room-view[data-room="seawater"] .room-image,
.room-view[data-room="seawater"] .room-image.is-contain {
  overflow: visible;
  isolation: auto;
  background: transparent !important;
  box-shadow: none !important;
}

.room-view[data-room="seawater"] .room-image::before,
.room-view[data-room="seawater"] .room-image::after,
.room-view[data-room="seawater"] .seawater-caustics {
  display: none !important;
}

.room-view[data-room="seawater"] .room-image img,
.room-view[data-room="seawater"] .room-image.is-contain img {
  z-index: 3;
  background: transparent;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.055),
    0 9px 24px rgba(0, 0, 0, 0.13);
}

.room-view[data-room="seawater"] .room-image figcaption {
  z-index: 4;
  color: rgba(239, 238, 230, 0.42);
  text-shadow: 0 1px 9px rgba(0, 0, 0, 0.62);
}

/* Keep the written sections legible once the optical corridor has faded away. */
.room-view[data-room="seawater"] .room-lead,
.room-view[data-room="seawater"] .room-notes,
.room-view[data-room="seawater"] .room-footer {
  position: relative;
  z-index: 3;
}

@media (max-width: 760px) {
  .seawater-world-light {
    transition-duration: 420ms;
  }

  .room-view[data-room="seawater"] .room-image img,
  .room-view[data-room="seawater"] .room-image.is-contain img {
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.05),
      0 7px 18px rgba(0, 0, 0, 0.12);
  }
}
'''
style_path.write_text(css, encoding='utf-8')
print('seawater long-space light world applied')
