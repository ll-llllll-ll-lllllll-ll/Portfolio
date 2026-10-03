from pathlib import Path
import re

script_path = Path('script.js')
index_path = Path('index.html')

js = script_path.read_text(encoding='utf-8')
html = index_path.read_text(encoding='utf-8')

# Replace the fixed-angle light state with a smoothed scroll-driven solar orbit.
old_state = '''    var currentLightAngle = null;\n    var fixedLightAngle = 145 * Math.PI / 180;\n'''
new_state = '''    var currentSolarProgress = null;\n'''
if old_state not in js:
    raise SystemExit('fixed light state block not found')
js = js.replace(old_state, new_state, 1)

# The virtual light now follows a 3D day arc driven by page scroll:
# morning = low/down-left, noon = high/above-left, evening = low/up-left.
light_pattern = re.compile(r'''    function lightForFrame\(\) \{.*?\n    \}\n\n    function physicalProjectRect''', re.S)
match = light_pattern.search(js)
if not match:
    raise SystemExit('lightForFrame block not found')

light_replacement = r'''    function lightForFrame() {
      /*
        Scroll-driven 3D solar arc.
        0.00 = low morning light from down-left
        0.50 = high noon light from almost overhead / slightly left
        1.00 = low evening light from up-left

        The scroll target is eased so the light has inertia instead of sticking
        directly to touch movement. Solar altitude follows sin(pi*p): high at
        noon, low at both ends. That same altitude later compresses / expands
        the projected caustic volume like a real morning-noon-evening shadow.
      */
      var targetProgress = clamp(scrollProgress(), 0, 1);
      if (currentSolarProgress == null) currentSolarProgress = targetProgress;
      currentSolarProgress += (targetProgress - currentSolarProgress) * 0.014;

      var p = clamp(currentSolarProgress, 0, 1);
      var altitude = Math.sin(Math.PI * p);
      var altitudeEase = Math.pow(clamp(altitude, 0, 1), 0.88);
      var mobile = width <= 760;
      var distance = Math.max(width, height) * lerp(1.52, 1.18, altitudeEase);

      /* Horizontal orbit: low sun sits farther left; noon comes closer to the
         vertical axis while remaining slightly left of the artwork. */
      var xOffset = lerp(0.72, 0.24, altitudeEase);

      /* Screen-space vertical keyframes, matching the user's 3D sketch:
         down-left -> overhead-left -> up-left. */
      var yOffset;
      if (p <= 0.5) {
        yOffset = lerp(0.58, -0.92, smoothstep01(p / 0.5));
      } else {
        yOffset = lerp(-0.92, -0.52, smoothstep01((p - 0.5) / 0.5));
      }

      var lowZ = mobile ? 1850 : 2450;
      var highZ = mobile ? 5200 : 6800;
      var z = lerp(lowZ, highZ, altitudeEase);

      document.documentElement.dataset.seawaterTimeSource = "scroll-solar-arc";
      document.documentElement.dataset.seawaterSolarAltitude = altitude.toFixed(3);
      document.documentElement.dataset.seawaterSolarProgress = p.toFixed(3);

      return {
        x: width * 0.5 - distance * xOffset,
        y: height * 0.5 + distance * yOffset,
        z: z,
        altitude: altitude,
        progress: p
      };
    }

    function physicalProjectRect'''
js = js[:match.start()] + light_replacement + js[match.end():]

# Replace the fixed-depth near-parallel projection with a near-parallel 3D volume
# whose length is controlled by solar altitude: long at dawn/dusk, short at noon.
volume_pattern = re.compile(r'''    function buildNearParallelProjectedVolume\(rect, index, light, canvasRect\) \{.*?\n    \}\n\n    function pathQuad''', re.S)
match = volume_pattern.search(js)
if not match:
    raise SystemExit('buildNearParallelProjectedVolume block not found')

volume_replacement = r'''    function buildSolarProjectedVolume(rect, index, light, canvasRect) {
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

      /* Height controls projection length. The noon volume becomes compact,
         while low morning/evening light produces a long caustic space. */
      var altitude = clamp(light.altitude == null ? 0.5 : light.altitude, 0, 1);
      var heightEase = Math.pow(altitude, 0.82);
      var longDepth = clamp(
        rect.width * (index === 0 ? 0.76 : 0.70),
        mobile ? 175 : 235,
        mobile ? 290 : 420
      );
      var noonDepth = clamp(
        rect.width * (index === 0 ? 0.24 : 0.22),
        mobile ? 68 : 92,
        mobile ? 118 : 158
      );
      var depth = lerp(longDepth, noonDepth, heightEase);
      var farCenter = {
        x: baseCenter.x + ux * depth,
        y: baseCenter.y + uy * depth
      };

      /* Keep the single-point character extremely restrained. A higher noon
         source reduces divergence further, so the volume feels almost parallel. */
      var elevation = clamp(
        rect.width * (index === 0 ? 0.18 : 0.16),
        mobile ? 44 : 60,
        mobile ? 90 : 124
      );
      var perspectiveScale = clamp(
        light.z / Math.max(1, light.z - elevation),
        1.006,
        1.028
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
        direction: { x: ux, y: uy },
        altitude: altitude,
        depth: depth
      };
    }

    function pathQuad'''
js = js[:match.start()] + volume_replacement + js[match.end():]

if 'var volume = buildNearParallelProjectedVolume(rect, index, light, canvasRect);' not in js:
    raise SystemExit('drawProjectedCaustic projection call not found')
js = js.replace(
    'var volume = buildNearParallelProjectedVolume(rect, index, light, canvasRect);',
    'var volume = buildSolarProjectedVolume(rect, index, light, canvasRect);',
    1,
)

# The directional front gate must scale with the current projection depth. This
# prevents a short noon projection from being eaten by a fixed 40-50px gate.
old_gate = '''      var gateBack = Math.max(10, edgeBlur * 1.25);\n      var gateForward = Math.max(18, edgeBlur * 1.80);\n'''
new_gate = '''      var gateBack = Math.min(axisLength * 0.10, Math.max(6, edgeBlur * 0.48));\n      var gateForward = Math.min(axisLength * 0.24, Math.max(10, edgeBlur * 0.92));\n'''
if old_gate not in js:
    raise SystemExit('front gate dimensions not found')
js = js.replace(old_gate, new_gate, 1)

# Diagnostics and cache bust.
js = js.replace(
    'document.documentElement.dataset.seawaterRenderer = "canvas2d-parallel3d-soft-caustics";',
    'document.documentElement.dataset.seawaterRenderer = "canvas2d-scroll-solar3d-caustics";',
    1,
)
js = js.replace(
    'document.documentElement.dataset.seawaterProjection = "fixed-near-parallel-single-point";',
    'document.documentElement.dataset.seawaterProjection = "scroll-solar-arc-3d";',
    1,
)

html = re.sub(r'2026100[34]-\d+', '20261004-0348', html)

script_path.write_text(js, encoding='utf-8')
index_path.write_text(html, encoding='utf-8')
