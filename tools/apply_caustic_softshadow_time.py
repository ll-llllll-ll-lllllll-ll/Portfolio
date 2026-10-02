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

    room.querySelectorAll(".seawater-world-light, .seawater-world-shadow, .seawater-caustics").forEach(function (node) {
      node.remove();
    });

    /*
      Canvas2D projected Water Caustics
      ---------------------------------
      Keep the earlier low-resolution optical interference field, but make the
      projected space almost parallel. A physical point-light projection still
      determines the direction and depth; only the exaggerated convergence is
      damped so the far rectangle shrinks by just a few percent.

      The caustic field is rendered in depth bands. Every band is progressively
      more blurred and less opaque, and the complete layer receives a small base
      blur so both long side edges are soft from beginning to end, like a real
      shadow / light volume.
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
    var soft = document.createElement("canvas");
    var softCtx = soft.getContext("2d", { alpha: true });
    if (!lowCtx || !softCtx) {
      canvas.remove();
      return;
    }

    var width = 1;
    var height = 1;
    var pixelRatio = 1;
    var lowWidth = 168;
    var lowHeight = 132;
    var lowImageData = null;
    var reduceMotion = false;
    var lastFrame = 0;
    var lastFieldFrame = -1;
    var currentLightAngle = null;
    var cachedLocalMinute = -1;
    var cachedSunAngle = Math.PI;

    try {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {}

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function lerpPoint(a, b, t) {
      return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
    }

    function scrollProgress() {
      var maxScroll = Math.max(1, scroll.scrollHeight - scroll.clientHeight);
      return clamp(scroll.scrollTop / maxScroll, 0, 1);
    }

    function localSunAngle() {
      /* Device-local time is available through Date(); browsers do not require a permission prompt for it. */
      var now = new Date();
      var minuteKey = now.getHours() * 60 + now.getMinutes();
      if (minuteKey === cachedLocalMinute) return cachedSunAngle;
      cachedLocalMinute = minuteKey;

      var dawn = 6 * 60;
      var dusk = 18 * 60;
      var dayProgress = clamp((minuteKey - dawn) / (dusk - dawn), 0, 1);

      /* A restrained left-side solar arc: roughly 166deg at dawn -> 194deg at dusk. */
      cachedSunAngle = (166 + dayProgress * 28) * Math.PI / 180;
      document.documentElement.dataset.seawaterTimeSource = "device-local-time";
      return cachedSunAngle;
    }

    function lightForFrame() {
      /* Scroll only nudges the time-derived angle by +/-4deg, then eases toward it slowly. */
      var target = localSunAngle() + (scrollProgress() - 0.5) * (8 * Math.PI / 180);
      if (currentLightAngle == null) currentLightAngle = target;

      var diff = Math.atan2(Math.sin(target - currentLightAngle), Math.cos(target - currentLightAngle));
      currentLightAngle += diff * 0.018;

      var radius = Math.min(width, height) * (width <= 760 ? 0.41 : 0.44);
      return {
        x: width * 0.5 + Math.cos(currentLightAngle) * radius,
        y: height * 0.50 + Math.sin(currentLightAngle) * radius,
        z: width <= 760 ? 600 : 720,
        angle: currentLightAngle
      };
    }

    function physicalProjectRect(rect, light, elevation, canvasRect) {
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

    function buildWeakProjectedVolume(rect, index, light, canvasRect) {
      var mobile = width <= 760;
      var elevation = clamp(
        rect.width * (index === 0 ? 0.37 : 0.34),
        mobile ? 76 : 104,
        mobile ? 165 : 220
      );
      var physical = physicalProjectRect(rect, light, elevation, canvasRect);
      var base = physical.base;
      var baseCenter = {
        x: (base[0].x + base[2].x) * 0.5,
        y: (base[0].y + base[2].y) * 0.5
      };
      var projectedCenter = {
        x: (physical.projected[0].x + physical.projected[2].x) * 0.5,
        y: (physical.projected[0].y + physical.projected[2].y) * 0.5
      };

      var dx = projectedCenter.x - baseCenter.x;
      var dy = projectedCenter.y - baseCenter.y;
      var physicalDepth = Math.sqrt(dx * dx + dy * dy);
      if (physicalDepth < 0.5) {
        dx = baseCenter.x - light.x;
        dy = baseCenter.y - light.y;
        physicalDepth = Math.sqrt(dx * dx + dy * dy) || 1;
      }
      var ux = dx / physicalDepth;
      var uy = dy / physicalDepth;

      /* Keep the old physical projection length, but damp it into a quieter, almost parallel volume. */
      var depth = clamp(
        physicalDepth * 1.10,
        mobile ? 120 : 165,
        mobile ? 285 : 395
      );
      var farCenter = {
        x: baseCenter.x + ux * depth,
        y: baseCenter.y + uy * depth
      };

      /* Only 2.2% convergence: nearly parallel, with the rest of the taper supplied by blur / fade. */
      var shrink = 0.022;
      var halfW = rect.width * (1 - shrink) * 0.5;
      var halfH = rect.height * (1 - shrink) * 0.5;
      var far = [
        { x: farCenter.x - halfW, y: farCenter.y - halfH },
        { x: farCenter.x + halfW, y: farCenter.y - halfH },
        { x: farCenter.x + halfW, y: farCenter.y + halfH },
        { x: farCenter.x - halfW, y: farCenter.y + halfH }
      ];

      return { base: base, far: far };
    }

    function pathQuad(targetCtx, quad) {
      targetCtx.beginPath();
      targetCtx.moveTo(quad[0].x, quad[0].y);
      targetCtx.lineTo(quad[1].x, quad[1].y);
      targetCtx.lineTo(quad[2].x, quad[2].y);
      targetCtx.lineTo(quad[3].x, quad[3].y);
      targetCtx.closePath();
    }

    function volumeQuad(volume) {
      return [volume.base[0], volume.base[1], volume.far[2], volume.far[3]];
    }

    function boundsOf(points) {
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      points.forEach(function (p) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });
      return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
    }

    function resizeWorld() {
      var rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      var mobile = width <= 760;

      pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.3);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      /* One CSS-pixel soft layer keeps edge blur inexpensive. */
      soft.width = Math.max(1, Math.round(width));
      soft.height = Math.max(1, Math.round(height));
      softCtx.imageSmoothingEnabled = true;
      softCtx.imageSmoothingQuality = "high";

      lowWidth = mobile ? 132 : 178;
      lowHeight = Math.round(lowWidth * Math.max(0.72, Math.min(1.08, height / Math.max(width, 1))));
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

          var wx = nx + 0.085 * Math.sin(ny * 12.5 + time * 1.46) + 0.034 * Math.sin(ny * 25.0 - time * 1.08 + 0.7);
          var wy = ny + 0.082 * Math.cos(nx * 11.2 - time * 1.28) + 0.030 * Math.cos(nx * 22.4 + time * 0.92 + 1.3);
          var a = Math.sin(wx * 18.0 + Math.sin(wy * 10.5 + time * 1.18));
          var b = Math.cos(wy * 17.0 + Math.sin(wx * 11.5 - time * 1.02));
          var c = Math.sin((wx + wy) * 12.2 + Math.cos((wx - wy) * 9.7 + time * 0.84));
          var d = Math.cos((wx - wy) * 14.3 + Math.sin(wy * 8.6 - time * 0.72));
          var f = (a + b + c + d) * 0.25;
          var ridge = Math.max(0, 1 - Math.abs(f) * 1.64);
          var core = Math.pow(ridge, 8.5);
          var halo = Math.pow(Math.max(0, 1 - Math.abs(f) * 1.02), 2.7) * 0.17;
          var crossField = Math.sin(wx * 13.5 + Math.sin(wy * 18.0 + time * 0.82)) * 0.55 +
            Math.cos(wy * 14.8 + Math.sin(wx * 16.0 - time * 0.88)) * 0.45;
          var crossing = Math.pow(Math.max(0, 1 - Math.abs(crossField) * 1.48), 7.2) * 0.26;
          var value = clamp(core * 1.06 + halo + crossing, 0, 1);

          /* Strict neutral grayscale. Equal RGB channels avoid the previous yellow / magenta interpolation fringes. */
          data[pointer] = 255;
          data[pointer + 1] = 255;
          data[pointer + 2] = 255;
          data[pointer + 3] = Math.round(value * 226);
          pointer += 4;
        }
      }

      lowCtx.putImageData(lowImageData, 0, 0);
    }

    function drawProjectedCaustic(rect, index, light, canvasRect) {
      if (rect.width < 2 || rect.height < 2) return;
      var mobile = width <= 760;
      var volume = buildWeakProjectedVolume(rect, index, light, canvasRect);
      var whole = volumeQuad(volume);
      var wholeBounds = boundsOf(volume.base.concat(volume.far));

      /* Neutral optical density only; no colored blend modes or contrast filters. */
      softCtx.save();
      pathQuad(softCtx, whole);
      softCtx.fillStyle = "rgba(126,126,126,0.085)";
      softCtx.fill();
      softCtx.restore();

      var bands = mobile ? 7 : 9;
      for (var i = 0; i < bands; i += 1) {
        var t0 = i / bands;
        var t1 = (i + 1) / bands;
        var tm = (t0 + t1) * 0.5;
        var band = [
          lerpPoint(volume.base[0], volume.far[0], t0),
          lerpPoint(volume.base[1], volume.far[1], t0),
          lerpPoint(volume.base[2], volume.far[2], t1),
          lerpPoint(volume.base[3], volume.far[3], t1)
        ];

        softCtx.save();
        pathQuad(softCtx, band);
        softCtx.clip();
        softCtx.globalCompositeOperation = "source-over";

        /* Distance field: the far end becomes visibly softer and more dissipated. */
        var blur = (mobile ? 0.45 : 0.55) + Math.pow(tm, 1.42) * (mobile ? 6.2 : 8.6);
        softCtx.filter = "blur(" + blur.toFixed(2) + "px)";
        softCtx.globalAlpha = (index === 0 ? 0.88 : 0.84) * (1 - tm * 0.38);
        softCtx.drawImage(
          low,
          wholeBounds.minX - 26,
          wholeBounds.minY - 26,
          (wholeBounds.maxX - wholeBounds.minX) + 52,
          (wholeBounds.maxY - wholeBounds.minY) + 52
        );
        softCtx.restore();
      }
    }

    function render(now) {
      if (!canvas.isConnected) return;
      var mobile = width <= 760;
      var frameInterval = mobile ? 52 : 40;

      if (now - lastFrame >= frameInterval || reduceMotion && lastFieldFrame < 0) {
        lastFrame = now;
        var fieldFrame = Math.floor(now / frameInterval);
        if (fieldFrame !== lastFieldFrame) {
          renderLowField(now * 0.00118);
          lastFieldFrame = fieldFrame;
        }

        softCtx.setTransform(1, 0, 0, 1, 0, 0);
        softCtx.clearRect(0, 0, width, height);

        var canvasRect = canvas.getBoundingClientRect();
        var images = Array.prototype.slice.call(scroll.querySelectorAll(".room-image img")).slice(0, 2);
        var light = lightForFrame();
        var anyVisible = false;

        images.forEach(function (image, index) {
          var rect = image.getBoundingClientRect();
          if (rect.bottom < canvasRect.top - height * 0.80 || rect.top > canvasRect.bottom + height * 0.80) return;
          anyVisible = true;
          drawProjectedCaustic(rect, index, light, canvasRect);
        });

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        /* Base blur keeps the two long side edges soft from the image outward, while band blur adds distance falloff. */
        ctx.filter = mobile ? "blur(1.55px)" : "blur(2.15px)";
        ctx.drawImage(soft, 0, 0, width, height);
        ctx.filter = "none";

        canvas.style.opacity = anyVisible ? "1" : "0";
        document.documentElement.dataset.seawaterRenderer = "canvas2d-soft-projected-caustics";
      }

      requestAnimationFrame(render);
    }

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

marker = '/* ===== Seawater neutral soft projected caustics ===== */'
if marker not in css:
    css += r'''

/* ===== Seawater neutral soft projected caustics ===== */
.room-view[data-room="seawater"] .seawater-caustic-projection {
  background: transparent !important;
  mix-blend-mode: normal !important;
  filter: none !important;
  image-rendering: auto;
}
'''

html = re.sub(r'v=\d{8}-\d{4}', 'v=20261003-0312', html)

script_path.write_text(js, encoding='utf-8')
style_path.write_text(css, encoding='utf-8')
index_path.write_text(html, encoding='utf-8')
