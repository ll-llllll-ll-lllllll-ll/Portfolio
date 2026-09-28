from pathlib import Path

script_path = Path('script.js')
style_path = Path('style.css')
js = script_path.read_text(encoding='utf-8')
css = style_path.read_text(encoding='utf-8')


def replace_between(text, start_marker, end_marker, replacement):
    start = text.find(start_marker)
    if start < 0:
        raise SystemExit(f'missing start marker: {start_marker}')
    end = text.find(end_marker, start)
    if end < 0:
        raise SystemExit(f'missing end marker: {end_marker}')
    return text[:start] + replacement + text[end:]

# 1) Reduce the light-source orbit: 9 o'clock -> 7 o'clock only.
light_block = r'''    function lightForScroll() {
      var p = scrollProgress();

      /*
        Small counter-clockwise arc only:
        start at 9 o'clock (180deg), end around 7 o'clock (240deg).
        The page therefore changes gently rather than swinging around the viewer.
      */
      var theta = (180 + p * 60) * Math.PI / 180;
      var radius = Math.min(width, height) * (width <= 760 ? 0.44 : 0.48);

      return {
        x: width * 0.5 + Math.cos(theta) * radius,
        y: height * 0.54 + Math.sin(theta) * radius,
        z: width <= 760 ? 620 : 760,
        progress: p
      };
    }

    function subjectBounds(canvasRect) {
      var images = scroll.querySelectorAll(".room-image img");
      if (!images.length) {
        return {
          cx: width * 0.5,
          halfW: width * 0.24,
          top: height * 0.18,
          bottom: height * 0.82
        };
      }

      var minL = Infinity;
      var maxR = -Infinity;
      var minT = Infinity;
      var maxB = -Infinity;

      images.forEach(function (img) {
        var rect = img.getBoundingClientRect();
        minL = Math.min(minL, rect.left - canvasRect.left);
        maxR = Math.max(maxR, rect.right - canvasRect.left);
        minT = Math.min(minT, rect.top - canvasRect.top);
        maxB = Math.max(maxB, rect.bottom - canvasRect.top);
      });

      return {
        cx: (minL + maxR) * 0.5,
        halfW: (maxR - minL) * 0.5 + width * 0.12,
        top: minT - height * 0.10,
        bottom: maxB + height * 0.16
      };
    }

'''
js = replace_between(js, '    function lightForScroll() {', '    function corridorIsVisible() {', light_block)

# 2) Higher internal resolution to remove enlarged-pixel feel.
old_low = '      lowWidth = mobile ? 112 : 164;\n'
new_low = '      lowWidth = mobile ? 160 : 240;\n'
if old_low not in js:
    raise SystemExit('lowWidth marker not found')
js = js.replace(old_low, new_low, 1)

# 3) Restrict caustics to the artwork corridor, make cells finer, movement calmer.
caustic_block = r'''    function renderCausticField(light, now) {
      if (!pixels || !imageData) return;

      var canvasRect = canvas.getBoundingClientRect();
      var bounds = subjectBounds(canvasRect);
      var centerX = width * 0.5;
      var centerY = height * 0.5;
      var dirX = centerX - light.x;
      var dirY = centerY - light.y;
      var dirLength = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
      var ndx = dirX / dirLength;
      var ndy = dirY / dirLength;

      /* Much calmer internal motion; scroll is still the main driver. */
      var phase = scroll.scrollTop * 0.0010 + (reduceMotion ? 0 : now * 0.00005);
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

          /* Narrower projected cone. */
          var cone = smoothstep(-0.06, 0.42, dot);

          /* Keep the light inside a long corridor around the two artworks. */
          var xNorm = Math.abs((sx - bounds.cx) / Math.max(bounds.halfW, 1));
          var beamX = 1 - smoothstep(0.72, 1.16, xNorm);
          var above = Math.max(0, (bounds.top - sy) / (height * 0.22));
          var below = Math.max(0, (sy - bounds.bottom) / (height * 0.26));
          var beamY = 1 - smoothstep(0.00, 1.00, Math.max(above, below));
          var corridorMask = beamX * beamY;

          /* Finer cells and weaker perspective growth than the previous full-screen version. */
          var perspective = 1 + distance / (width <= 760 ? 980 : 1280);
          var u = vx / (46 * perspective);
          var v = vy / (46 * perspective);
          var qx = u + 0.20 * Math.sin(v * 1.28 + phase * 0.28) +
            0.08 * Math.sin(v * 2.05 - phase * 0.12 + 1.2);
          var qy = v + 0.20 * Math.cos(u * 1.18 - phase * 0.22) +
            0.08 * Math.cos(u * 1.92 + phase * 0.11);
          var a = Math.sin(qx * 2.05 + Math.sin(qy * 1.48 + phase * 0.20));
          var b = Math.cos(qy * 2.00 + Math.sin(qx * 1.34 - phase * 0.16));
          var c = Math.sin((qx + qy) * 1.18 + Math.cos((qx - qy) * 1.28 + phase * 0.12));
          var f = (a + b + c) / 3;
          var line = Math.max(0, 1 - Math.abs(f) * 1.45);
          var sharpness = 6.4 - 2.2 * clamp(distance / 1400, 0, 1);
          line = Math.pow(line, sharpness);
          var falloff = 0.88 - 0.24 * clamp(distance / 1500, 0, 1);
          var value = clamp(line * cone * corridorMask * falloff, 0, 1);
          var alpha = Math.round(value * 185);

          pixels[pointer] = 242;
          pixels[pointer + 1] = 242;
          pixels[pointer + 2] = 235;
          pixels[pointer + 3] = alpha;
          pointer += 4;
        }
      }

      lowCtx.putImageData(imageData, 0, 0);
    }

'''
js = replace_between(js, '    function renderCausticField(light, now) {', '    function convexHull(points) {', caustic_block)

# 4) Replace the shadow renderer with depth-banded penumbra: crisp near, progressively soft far.
shadow_block = r'''    function lerpPoint(a, b, t) {
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t
      };
    }

    function projectRect(rect, light, elevation, offsetX, offsetY, canvasRect) {
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
      return { base: base, projected: projected };
    }

    function fillHullBlur(points, alpha, blurPx) {
      if (!points.length) return;
      ctx.save();
      ctx.filter = blurPx > 0 ? ("blur(" + blurPx + "px)") : "none";
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

        var elevation = clamp(
          rect.width * (index === 0 ? 0.31 : 0.27),
          mobile ? 66 : 88,
          mobile ? 126 : 176
        );
        var geom = projectRect(rect, light, elevation, 0, 0, canvasRect);

        /* Solid contact shadow: the caustics should disappear directly behind the object. */
        var contactHull = convexHull(
          geom.base.concat(geom.base.map(function (p, idx) {
            return lerpPoint(p, geom.projected[idx], 0.16);
          }))
        );
        fillHullBlur(contactHull, 0.58, 0);

        /*
          Split the projected wedge into depth bands. Blur grows with distance,
          so the image edge stays comparatively crisp while the far end becomes
          a broad soft penumbra. Each darker band also suppresses the caustic field
          underneath instead of letting the bright lines remain visible through it.
        */
        var bands = mobile ? 8 : 10;
        for (var i = 0; i < bands; i += 1) {
          var t0 = 0.10 + (i / bands) * 0.90;
          var t1 = 0.10 + ((i + 1) / bands) * 0.90;
          var near = geom.base.map(function (p, idx) {
            return lerpPoint(p, geom.projected[idx], t0);
          });
          var far = geom.base.map(function (p, idx) {
            return lerpPoint(p, geom.projected[idx], t1);
          });
          var bandHull = convexHull(near.concat(far));
          var blurPx = mobile ? (0.8 + i * 1.7) : (1.0 + i * 2.2);
          var alpha = mobile ? (0.25 - i * 0.020) : (0.23 - i * 0.017);
          fillHullBlur(bandHull, Math.max(alpha, 0.055), blurPx);
        }
      });
    }

'''
js = replace_between(js, '    function renderShadows(light) {', '    function drawWorld(now, forceField) {', shadow_block)

# 5) Lower the brightness of the whole caustic layer.
old_alpha = '      ctx.globalAlpha = width <= 760 ? 0.78 : 0.74;\n'
new_alpha = '      ctx.globalAlpha = width <= 760 ? 0.58 : 0.54;\n'
if old_alpha not in js:
    raise SystemExit('world alpha marker not found')
js = js.replace(old_alpha, new_alpha, 1)

# 6) Slight CSS smoothing for the upscaled procedural field.
marker = '/* ===== Seawater light-space refinement v2 ===== */'
if marker not in css:
    css += r'''

/* ===== Seawater light-space refinement v2 ===== */
.room-view[data-room="seawater"] .seawater-world-light {
  filter: blur(2.5px);
  transform: translateZ(0);
}

@media (max-width: 760px) {
  .room-view[data-room="seawater"] .seawater-world-light {
    filter: blur(2px);
  }
}
'''

script_path.write_text(js, encoding='utf-8')
style_path.write_text(css, encoding='utf-8')
print('seawater refinement applied')
