from pathlib import Path
import re

script_path = Path('script.js')
index_path = Path('index.html')

js = script_path.read_text(encoding='utf-8')
html = index_path.read_text(encoding='utf-8')

# Restore the original point-light 3D projection geometry. Keep the newer
# Safari-safe blur pyramid, but stop flattening the far face into a translated,
# almost same-size rectangle.
pattern = re.compile(r'''    function buildWeakProjectedVolume\(rect, index, light, canvasRect\) \{.*?\n    \}\n\n    function pathQuad''', re.S)
match = pattern.search(js)
if not match:
    raise SystemExit('buildWeakProjectedVolume block not found')

replacement = r'''    function buildPhysicalProjectedVolume(rect, index, light, canvasRect) {
      var mobile = width <= 760;

      /*
        Restore the original 3D point-light construction:
        each artwork is a rectangle lifted above the page by a virtual z height.
        Every corner is projected through the point light onto the page plane.
        The projected far face therefore grows / shifts naturally with the light,
        instead of being replaced by an almost-parallel translated rectangle.
      */
      var elevation = clamp(
        rect.width * (index === 0 ? 0.31 : 0.27),
        mobile ? 66 : 88,
        mobile ? 126 : 176
      );
      var physical = physicalProjectRect(rect, light, elevation, canvasRect);

      return {
        base: physical.base,
        far: physical.projected,
        elevation: elevation
      };
    }

    function pathQuad'''
js = js[:match.start()] + replacement + js[match.end():]

old_volume = '''    function volumeQuad(volume) {
      return [volume.base[0], volume.base[1], volume.far[2], volume.far[3]];
    }
'''
new_volume = '''    function cross(o, a, b) {
      return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    }

    function convexHull(points) {
      var sorted = points.slice().sort(function (a, b) {
        return a.x === b.x ? a.y - b.y : a.x - b.x;
      });
      if (sorted.length <= 2) return sorted;

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

      upper.pop();
      lower.pop();
      return lower.concat(upper);
    }

    function volumeHull(volume) {
      return convexHull(volume.base.concat(volume.far));
    }

    function pathPolygon(targetCtx, points) {
      if (!points || !points.length) return;
      targetCtx.beginPath();
      targetCtx.moveTo(points[0].x, points[0].y);
      for (var i = 1; i < points.length; i += 1) {
        targetCtx.lineTo(points[i].x, points[i].y);
      }
      targetCtx.closePath();
    }
'''
if old_volume not in js:
    raise SystemExit('volumeQuad block not found')
js = js.replace(old_volume, new_volume, 1)

# The blur mask must follow the convex hull of the actual 3D projection, not a
# hard-coded four-corner strip. This preserves the visible wedge / side-plane
# geometry while retaining the continuous Safari-safe softness.
old_mask_head = '''    function buildLayerMask(volume, stops, edgeBlur) {
      var whole = volumeQuad(volume);
      var axis = volumeAxis(volume);
'''
new_mask_head = '''    function buildLayerMask(volume, stops, edgeBlur) {
      var whole = volumeHull(volume);
      var axis = volumeAxis(volume);
'''
if old_mask_head not in js:
    raise SystemExit('buildLayerMask head not found')
js = js.replace(old_mask_head, new_mask_head, 1)

old_mask_path = '''      maskCtx.save();
      maskCtx.shadowColor = "rgba(255,255,255,0.95)";
      maskCtx.shadowBlur = edgeBlur;
      maskCtx.fillStyle = "rgba(255,255,255,0.96)";
      pathQuad(maskCtx, whole);
      maskCtx.fill();
      maskCtx.restore();
'''
new_mask_path = '''      maskCtx.save();
      maskCtx.shadowColor = "rgba(255,255,255,0.95)";
      maskCtx.shadowBlur = edgeBlur;
      maskCtx.fillStyle = "rgba(255,255,255,0.96)";
      pathPolygon(maskCtx, whole);
      maskCtx.fill();
      maskCtx.restore();
'''
if old_mask_path not in js:
    raise SystemExit('mask path block not found')
js = js.replace(old_mask_path, new_mask_path, 1)

if 'var volume = buildWeakProjectedVolume(rect, index, light, canvasRect);' not in js:
    raise SystemExit('drawProjectedCaustic volume call not found')
js = js.replace(
    'var volume = buildWeakProjectedVolume(rect, index, light, canvasRect);',
    'var volume = buildPhysicalProjectedVolume(rect, index, light, canvasRect);',
    1,
)

# Slightly strengthen the far-focus spread now that the shape once again has
# physical perspective. No Canvas2D filter is used, so this remains iOS-safe.
js = js.replace(
    '[[0, 0], [0.36, 0.08], [0.58, 0.28], [0.78, 0.50], [1, 0.34]],\n        mobile ? 12 : 15,',
    '[[0, 0], [0.30, 0.07], [0.54, 0.26], [0.76, 0.52], [1, 0.40]],\n        mobile ? 14 : 17,',
    1,
)

# Make the active renderer state explicit for later debugging.
js = js.replace(
    'document.documentElement.dataset.seawaterRenderer = "canvas2d-soft-projected-caustics";',
    'document.documentElement.dataset.seawaterRenderer = "canvas2d-physical3d-caustics";\n        document.documentElement.dataset.seawaterProjection = "point-light-xyz";',
    1,
)

# Cache bust so iPhone Safari picks up the restored geometry immediately.
html = re.sub(r'20261003-\d+', '20261003-0430', html)

script_path.write_text(js, encoding='utf-8')
index_path.write_text(html, encoding='utf-8')
