from pathlib import Path
import re

script_path = Path('script.js')
index_path = Path('index.html')

js = script_path.read_text(encoding='utf-8')
html = index_path.read_text(encoding='utf-8')

# Remove device-local-time steering. A fixed distant virtual light is much more
# predictable compositionally and avoids the projection collapsing toward the
# artwork at some hours of the day.
old_state = '''    var currentLightAngle = null;\n    var cachedLocalMinute = -1;\n    var cachedSunAngle = Math.PI;\n'''
new_state = '''    var currentLightAngle = null;\n    var fixedLightAngle = 145 * Math.PI / 180;\n'''
if old_state not in js:
    raise SystemExit('light state block not found')
js = js.replace(old_state, new_state, 1)

light_pattern = re.compile(r'''    function localSunAngle\(\) \{.*?\n    \}\n\n    function lightForFrame\(\) \{.*?\n    \}\n\n    function physicalProjectRect''', re.S)
match = light_pattern.search(js)
if not match:
    raise SystemExit('localSunAngle/lightForFrame block not found')

light_replacement = r'''    function lightForFrame() {
      /*
        Fixed distant light. The source sits down-left of the artwork so the
        projected caustic volume travels up-right, matching the chosen visual
        composition. Scroll only adds a very small, slowly-eased +/-2.5deg nudge.
      */
      var target = fixedLightAngle + (scrollProgress() - 0.5) * (5 * Math.PI / 180);
      if (currentLightAngle == null) currentLightAngle = target;

      var diff = Math.atan2(Math.sin(target - currentLightAngle), Math.cos(target - currentLightAngle));
      currentLightAngle += diff * 0.012;

      var distance = Math.max(width, height) * 1.65;
      document.documentElement.dataset.seawaterTimeSource = "fixed-angle";
      return {
        x: width * 0.5 + Math.cos(currentLightAngle) * distance,
        y: height * 0.50 + Math.sin(currentLightAngle) * distance,
        z: width <= 760 ? 2600 : 3400,
        angle: currentLightAngle
      };
    }

    function physicalProjectRect'''
js = js[:match.start()] + light_replacement + js[match.end():]

# Replace the shallow exact physical projection with a near-parallel single-point
# construction. Direction still comes from one point source, but projection depth
# is long enough that only the two trailing silhouette edges are normally visible.
volume_pattern = re.compile(r'''    function buildPhysicalProjectedVolume\(rect, index, light, canvasRect\) \{.*?\n    \}\n\n    function pathQuad''', re.S)
match = volume_pattern.search(js)
if not match:
    raise SystemExit('buildPhysicalProjectedVolume block not found')

volume_replacement = r'''    function buildNearParallelProjectedVolume(rect, index, light, canvasRect) {
      var mobile = width <= 760;
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

      var baseCenter = {
        x: (left + right) * 0.5,
        y: (top + bottom) * 0.5
      };
      var dx = baseCenter.x - light.x;
      var dy = baseCenter.y - light.y;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / len;
      var uy = dy / len;

      /* Long enough to read as projection, but restrained relative to the page. */
      var depth = clamp(
        rect.width * (index === 0 ? 0.60 : 0.56),
        mobile ? 150 : 210,
        mobile ? 235 : 360
      );
      var farCenter = {
        x: baseCenter.x + ux * depth,
        y: baseCenter.y + uy * depth
      };

      /* A distant single point still produces a tiny amount of divergence. */
      var elevation = clamp(
        rect.width * (index === 0 ? 0.20 : 0.18),
        mobile ? 48 : 66,
        mobile ? 96 : 132
      );
      var perspectiveScale = clamp(
        light.z / Math.max(1, light.z - elevation),
        1.010,
        1.035
      );
      var halfW = rect.width * perspectiveScale * 0.5;
      var halfH = rect.height * perspectiveScale * 0.5;
      var far = [
        { x: farCenter.x - halfW, y: farCenter.y - halfH },
        { x: farCenter.x + halfW, y: farCenter.y - halfH },
        { x: farCenter.x + halfW, y: farCenter.y + halfH },
        { x: farCenter.x - halfW, y: farCenter.y + halfH }
      ];

      return {
        base: base,
        far: far,
        elevation: elevation,
        direction: { x: ux, y: uy }
      };
    }

    function pathQuad'''
js = js[:match.start()] + volume_replacement + js[match.end():]

if 'var volume = buildPhysicalProjectedVolume(rect, index, light, canvasRect);' not in js:
    raise SystemExit('projection call not found')
js = js.replace(
    'var volume = buildPhysicalProjectedVolume(rect, index, light, canvasRect);',
    'var volume = buildNearParallelProjectedVolume(rect, index, light, canvasRect);',
    1,
)

# Stop the geometric edge feather from bleeding backward around the light-facing
# sides of the artwork. The front-gate mask suppresses everything before the near
# plane, while still allowing the two trailing edges and far end to blur normally.
needle = '''      maskCtx.globalCompositeOperation = "destination-in";\n      maskCtx.fillStyle = gradient;\n      maskCtx.fillRect(0, 0, width, height);\n      maskCtx.globalCompositeOperation = "source-over";\n    }\n\n    function drawCausticLayer'''
replacement = '''      maskCtx.globalCompositeOperation = "destination-in";\n      maskCtx.fillStyle = gradient;\n      maskCtx.fillRect(0, 0, width, height);\n\n      /* Directional front gate: no caustic halo may wrap around the light-facing\n         sides of the image. This is the key fix for the extra two/three edges. */\n      var axisDx = axis.far.x - axis.near.x;\n      var axisDy = axis.far.y - axis.near.y;\n      var axisLength = Math.sqrt(axisDx * axisDx + axisDy * axisDy) || 1;\n      var dirX = axisDx / axisLength;\n      var dirY = axisDy / axisLength;\n      var gateBack = Math.max(10, edgeBlur * 1.25);\n      var gateForward = Math.max(18, edgeBlur * 1.80);\n      var gate = maskCtx.createLinearGradient(\n        axis.near.x - dirX * gateBack,\n        axis.near.y - dirY * gateBack,\n        axis.near.x + dirX * gateForward,\n        axis.near.y + dirY * gateForward\n      );\n      gate.addColorStop(0, "rgba(255,255,255,0)");\n      gate.addColorStop(0.38, "rgba(255,255,255,0)");\n      gate.addColorStop(0.72, "rgba(255,255,255,0.82)");\n      gate.addColorStop(1, "rgba(255,255,255,1)");\n      maskCtx.fillStyle = gate;\n      maskCtx.fillRect(0, 0, width, height);\n      maskCtx.globalCompositeOperation = "source-over";\n    }\n\n    function drawCausticLayer'''
if needle not in js:
    raise SystemExit('mask gradient tail not found')
js = js.replace(needle, replacement, 1)

js = js.replace(
    'document.documentElement.dataset.seawaterProjection = "point-light-xyz";',
    'document.documentElement.dataset.seawaterProjection = "fixed-near-parallel-single-point";',
    1,
)

# Cache bust so Safari loads the corrected projection immediately.
html = re.sub(r'20261003-\d+', '20261003-2005', html)

script_path.write_text(js, encoding='utf-8')
index_path.write_text(html, encoding='utf-8')
