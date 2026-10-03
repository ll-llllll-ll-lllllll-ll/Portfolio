from pathlib import Path
import re

script_path = Path('script.js')
index_path = Path('index.html')

js = script_path.read_text(encoding='utf-8')
html = index_path.read_text(encoding='utf-8')

# 1) Keep the point-light geometry but move the virtual light much farther away.
# This preserves real single-point perspective while making the rays nearly parallel.
old_light = '''      var radius = Math.min(width, height) * (width <= 760 ? 0.41 : 0.44);
      return {
        x: width * 0.5 + Math.cos(currentLightAngle) * radius,
        y: height * 0.50 + Math.sin(currentLightAngle) * radius,
        z: width <= 760 ? 600 : 720,
        angle: currentLightAngle
      };
'''
new_light = '''      /* A distant point light gives an almost-parallel one-point projection. */
      var radius = Math.min(width, height) * (width <= 760 ? 0.22 : 0.25);
      return {
        x: width * 0.5 + Math.cos(currentLightAngle) * radius,
        y: height * 0.50 + Math.sin(currentLightAngle) * radius,
        z: width <= 760 ? 1500 : 1900,
        angle: currentLightAngle
      };
'''
if old_light not in js:
    raise SystemExit('lightForFrame block not found')
js = js.replace(old_light, new_light, 1)

old_elevation = '''      var elevation = clamp(
        rect.width * (index === 0 ? 0.31 : 0.27),
        mobile ? 66 : 88,
        mobile ? 126 : 176
      );
'''
new_elevation = '''      var elevation = clamp(
        rect.width * (index === 0 ? 0.23 : 0.20),
        mobile ? 54 : 72,
        mobile ? 108 : 148
      );
'''
if old_elevation not in js:
    raise SystemExit('physical elevation block not found')
js = js.replace(old_elevation, new_elevation, 1)

# 2) Raise every optical field level substantially. The previous far buffer was
# only ~37 px wide on iPhone and therefore became visibly blocky when enlarged.
old_res = '''      pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.3);
'''
new_res = '''      pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.35 : 1.5);
'''
if old_res not in js:
    raise SystemExit('pixel ratio block not found')
js = js.replace(old_res, new_res, 1)

old_low = '''      lowWidth = mobile ? 132 : 178;
      lowHeight = Math.round(lowWidth * Math.max(0.72, Math.min(1.08, height / Math.max(width, 1))));
      low.width = lowWidth;
      low.height = lowHeight;
      lowCtx.imageSmoothingEnabled = true;
      lowCtx.imageSmoothingQuality = "high";
      lowImageData = lowCtx.createImageData(lowWidth, lowHeight);

      mid.width = Math.max(48, Math.round(lowWidth * 0.56));
      mid.height = Math.max(36, Math.round(lowHeight * 0.56));
      far.width = Math.max(28, Math.round(lowWidth * 0.28));
      far.height = Math.max(22, Math.round(lowHeight * 0.28));
'''
new_low = '''      lowWidth = mobile ? 220 : 300;
      lowHeight = Math.round(lowWidth * Math.max(0.72, Math.min(1.08, height / Math.max(width, 1))));
      low.width = lowWidth;
      low.height = lowHeight;
      lowCtx.imageSmoothingEnabled = true;
      lowCtx.imageSmoothingQuality = "high";
      lowImageData = lowCtx.createImageData(lowWidth, lowHeight);

      /* Keep the blur pyramid dense enough that Safari never exposes pixel blocks. */
      mid.width = Math.max(150, Math.round(lowWidth * 0.76));
      mid.height = Math.max(108, Math.round(lowHeight * 0.76));
      far.width = Math.max(108, Math.round(lowWidth * 0.52));
      far.height = Math.max(82, Math.round(lowHeight * 0.52));
'''
if old_low not in js:
    raise SystemExit('low/mid/far resolution block not found')
js = js.replace(old_low, new_low, 1)

# 3) Replace the old shadowBlur mask with a geometric feather. Safari can draw
# shadowBlur inconsistently around a transformed/animated polygon, leaving a
# straight hard hull. A stack of slightly expanded/contracted convex polygons
# creates a continuous alpha ramp without ctx.filter or shadowBlur.
mask_pattern = re.compile(r'''    function buildLayerMask\(volume, stops, edgeBlur\) \{.*?\n    \}\n\n    function drawCausticLayer''', re.S)
mask_match = mask_pattern.search(js)
if not mask_match:
    raise SystemExit('buildLayerMask function not found')

mask_replacement = r'''    function polygonCenter(points) {
      var sumX = 0;
      var sumY = 0;
      points.forEach(function (point) {
        sumX += point.x;
        sumY += point.y;
      });
      return {
        x: sumX / Math.max(1, points.length),
        y: sumY / Math.max(1, points.length)
      };
    }

    function scalePolygon(points, center, scale) {
      return points.map(function (point) {
        return {
          x: center.x + (point.x - center.x) * scale,
          y: center.y + (point.y - center.y) * scale
        };
      });
    }

    function buildLayerMask(volume, stops, edgeBlur) {
      var whole = volumeHull(volume);
      var axis = volumeAxis(volume);
      var center = polygonCenter(whole);
      var mobile = width <= 760;

      maskCtx.setTransform(1, 0, 0, 1, 0, 0);
      maskCtx.clearRect(0, 0, width, height);
      maskCtx.globalCompositeOperation = "source-over";

      /*
        Safari-safe geometric feather:
        many translucent hulls span from slightly outside the projected volume
        to slightly inside it. The result is a real soft edge with no visible
        straight clipping line, and the far optical layers request a wider feather.
      */
      var reference = Math.max(260, Math.min(width, height));
      var feather = clamp(edgeBlur / reference * 0.46, 0.008, 0.070);
      var steps = mobile ? 16 : 20;
      var passAlpha = mobile ? 0.115 : 0.095;

      for (var i = 0; i < steps; i += 1) {
        var t = steps <= 1 ? 0.5 : i / (steps - 1);
        var scale = 1 + feather - feather * 2 * t;
        var feathered = scalePolygon(whole, center, scale);
        maskCtx.fillStyle = "rgba(255,255,255," + passAlpha + ")";
        pathPolygon(maskCtx, feathered);
        maskCtx.fill();
      }

      var gradient = maskCtx.createLinearGradient(axis.near.x, axis.near.y, axis.far.x, axis.far.y);
      stops.forEach(function (stop) {
        gradient.addColorStop(stop[0], "rgba(255,255,255," + stop[1] + ")");
      });
      maskCtx.globalCompositeOperation = "destination-in";
      maskCtx.fillStyle = gradient;
      maskCtx.fillRect(0, 0, width, height);
      maskCtx.globalCompositeOperation = "source-over";
    }

    function drawCausticLayer'''
js = js[:mask_match.start()] + mask_replacement + js[mask_match.end():]

# 4) Rebalance depth layers: keep near detail crisp, but make medium/far layers
# dominate progressively so both caustic detail and the two long side edges soften.
old_draw = '''      drawCausticLayer(
        low,
        volume,
        wholeBounds,
        [[0, 1], [0.20, 0.94], [0.43, 0.70], [0.66, 0.10], [0.78, 0]],
        mobile ? 5 : 6,
        baseAlpha
      );
      drawCausticLayer(
        mid,
        volume,
        wholeBounds,
        [[0, 0.10], [0.22, 0.30], [0.48, 0.60], [0.72, 0.50], [0.90, 0.12], [1, 0]],
        mobile ? 8 : 10,
        baseAlpha * 0.92
      );
      drawCausticLayer(
        far,
        volume,
        wholeBounds,
        [[0, 0], [0.30, 0.07], [0.54, 0.26], [0.76, 0.52], [1, 0.40]],
        mobile ? 14 : 17,
        baseAlpha * 0.84
      );
'''
new_draw = '''      drawCausticLayer(
        low,
        volume,
        wholeBounds,
        [[0, 1], [0.14, 0.96], [0.30, 0.66], [0.48, 0.16], [0.58, 0]],
        mobile ? 7 : 8,
        baseAlpha
      );
      drawCausticLayer(
        mid,
        volume,
        wholeBounds,
        [[0, 0.12], [0.18, 0.30], [0.42, 0.60], [0.68, 0.56], [0.88, 0.20], [1, 0]],
        mobile ? 14 : 17,
        baseAlpha * 0.90
      );
      drawCausticLayer(
        far,
        volume,
        wholeBounds,
        [[0, 0], [0.28, 0.05], [0.50, 0.22], [0.72, 0.50], [0.90, 0.60], [1, 0.50]],
        mobile ? 28 : 34,
        baseAlpha * 0.78
      );
'''
if old_draw not in js:
    raise SystemExit('draw caustic layer block not found')
js = js.replace(old_draw, new_draw, 1)

# Give the caustic source enough room beyond the hull so the widened feather is
# never clipped at the offscreen-layer bounds.
js = js.replace('      var pad = 42;\n', '      var pad = 76;\n', 1)

# Renderer diagnostic marker and cache bust.
js = js.replace(
    'document.documentElement.dataset.seawaterRenderer = "canvas2d-physical3d-caustics";',
    'document.documentElement.dataset.seawaterRenderer = "canvas2d-parallel3d-soft-caustics";',
    1,
)
html = re.sub(r'20261003-\d+', '20261003-1645', html)

script_path.write_text(js, encoding='utf-8')
index_path.write_text(html, encoding='utf-8')
