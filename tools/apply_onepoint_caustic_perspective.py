from pathlib import Path
import re

script_path = Path('script.js')
index_path = Path('index.html')

js = script_path.read_text(encoding='utf-8')
html = index_path.read_text(encoding='utf-8')

project_pattern = re.compile(r'''    function projectRect\(rect, light, elevation, canvasRect\) \{.*?\n    \}\n\n    function hullPath''', re.S)
project_replacement = r'''    function projectRect(rect, light, elevation, canvasRect) {
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

      /*
        One-point perspective optical volume.
        All four depth edges aim at one vanishing point placed in the direction
        opposite the moving light. The far plane therefore becomes smaller as it
        recedes, instead of expanding like a physical cast shadow.
      */
      var center = {
        x: (left + right) * 0.5,
        y: (top + bottom) * 0.5
      };
      var dirX = center.x - light.x;
      var dirY = center.y - light.y;
      var dirLength = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
      dirX /= dirLength;
      dirY /= dirLength;

      var mobile = width <= 760;
      var vanishingDistance = Math.min(width, height) * (mobile ? 1.18 : 1.34) + rect.width * 0.38;
      var vanishingPoint = {
        x: center.x + dirX * vanishingDistance,
        y: center.y + dirY * vanishingDistance
      };

      var depth = clamp((elevation / Math.max(light.z, 1)) * 1.42, mobile ? 0.30 : 0.32, mobile ? 0.46 : 0.50);
      var projected = base.map(function (point) {
        return {
          x: point.x + (vanishingPoint.x - point.x) * depth,
          y: point.y + (vanishingPoint.y - point.y) * depth
        };
      });

      return {
        base: base,
        projected: projected,
        vanishingPoint: vanishingPoint,
        depth: depth
      };
    }

    function interpolateQuad(a, b, t) {
      return a.map(function (point, index) {
        return {
          x: point.x + (b[index].x - point.x) * t,
          y: point.y + (b[index].y - point.y) * t
        };
      });
    }

    function hullPath'''

if not project_pattern.search(js):
    raise SystemExit('projectRect block not found')
js = project_pattern.sub(project_replacement, js, count=1)

draw_pattern = re.compile(r'''    function drawProjectedCaustic\(rect, index, light, canvasRect\) \{.*?\n    \}\n\n    function render\(now\) \{''', re.S)
draw_replacement = r'''    function drawProjectedCaustic(rect, index, light, canvasRect) {
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
      var farCenter = {
        x: (geom.projected[0].x + geom.projected[2].x) * 0.5,
        y: (geom.projected[0].y + geom.projected[2].y) * 0.5
      };

      ctx.save();
      hullPath(hull);
      ctx.clip();

      /* A very faint optical body keeps the caustics legible on the warm paper. */
      var volume = ctx.createLinearGradient(baseCenter.x, baseCenter.y, farCenter.x, farCenter.y);
      volume.addColorStop(0, "rgba(116, 114, 104, 0.14)");
      volume.addColorStop(0.52, "rgba(126, 124, 114, 0.095)");
      volume.addColorStop(1, "rgba(132, 130, 120, 0.035)");
      ctx.fillStyle = volume;
      ctx.fillRect(minX - 8, minY - 8, maxX - minX + 16, maxY - minY + 16);
      ctx.restore();

      /*
        Depth-banded caustics: near the artwork the field stays crisp; every band
        farther toward the single vanishing point receives more blur and slightly
        less contrast/opacity. Bands overlap a little so no hard seams appear.
      */
      var bands = mobile ? 6 : 8;
      var padT = 0.022;
      for (var band = 0; band < bands; band += 1) {
        var rawT0 = band / bands;
        var rawT1 = (band + 1) / bands;
        var t0 = Math.max(0, rawT0 - padT);
        var t1 = Math.min(1, rawT1 + padT);
        var mid = (rawT0 + rawT1) * 0.5;
        var nearQuad = interpolateQuad(geom.base, geom.projected, t0);
        var farQuad = interpolateQuad(geom.base, geom.projected, t1);
        var bandHull = convexHull(nearQuad.concat(farQuad));
        if (bandHull.length < 3) continue;

        var blurPx = (mobile ? 0.45 : 0.50) + Math.pow(mid, 1.55) * (mobile ? 4.0 : 5.6);
        var contrast = 1.34 - mid * 0.22;
        var alpha = (index === 0 ? 0.94 : 0.90) * (1.0 - mid * 0.34);

        ctx.save();
        hullPath(bandHull);
        ctx.clip();
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = alpha;
        ctx.filter = "blur(" + blurPx.toFixed(2) + "px) contrast(" + contrast.toFixed(2) + ")";
        ctx.drawImage(low, minX - 20, minY - 20, (maxX - minX) + 40, (maxY - minY) + 40);
        ctx.restore();
      }

      /* Soft bloom is also depth-biased, strongest near the front plane. */
      ctx.save();
      hullPath(hull);
      ctx.clip();
      ctx.globalAlpha = mobile ? 0.18 : 0.21;
      ctx.filter = mobile ? "blur(3.2px)" : "blur(3.8px)";
      ctx.drawImage(low, minX - 20, minY - 20, (maxX - minX) + 40, (maxY - minY) + 40);
      ctx.restore();
    }

    function render(now) {'''

if not draw_pattern.search(js):
    raise SystemExit('drawProjectedCaustic block not found')
js = draw_pattern.sub(draw_replacement, js, count=1)

js = js.replace('document.documentElement.dataset.seawaterRenderer = "canvas2d-projected-caustics";', 'document.documentElement.dataset.seawaterRenderer = "canvas2d-onepoint-caustics";')

old_versions = ['20261002-1625', '20261002-1646', '20261002-1647']
for version in old_versions:
    html = html.replace(version, '20261002-1652')

script_path.write_text(js, encoding='utf-8')
index_path.write_text(html, encoding='utf-8')
