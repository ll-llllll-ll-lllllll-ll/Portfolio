from pathlib import Path
import re

script_path = Path('script.js')
style_path = Path('style.css')
index_path = Path('index.html')

js = script_path.read_text(encoding='utf-8')
css = style_path.read_text(encoding='utf-8')
html = index_path.read_text(encoding='utf-8')

new_mount = r'''  function mountSeawaterWorld(item) {
    if (!item || item.slug !== "seawater") return;

    var room = document.querySelector('.room-view[data-room="seawater"]');
    if (!room) return;

    var scroll = room.querySelector(".room-scroll");
    if (!scroll || room.querySelector(".seawater-world-light")) return;

    /*
      Performance architecture
      ------------------------
      Caustics are now a low-power WebGL fragment shader: the GPU evaluates the
      continuous optical field in parallel, so there is no JavaScript per-pixel loop.
      Cast shadows stay on a separate 2D canvas and are redrawn only when scroll / size
      changes, because their geometry does not need to animate every frame.
    */
    var lightCanvas = document.createElement("canvas");
    lightCanvas.className = "seawater-world-light";
    lightCanvas.setAttribute("aria-hidden", "true");

    var shadowCanvas = document.createElement("canvas");
    shadowCanvas.className = "seawater-world-shadow";
    shadowCanvas.setAttribute("aria-hidden", "true");

    room.insertBefore(lightCanvas, scroll);
    room.insertBefore(shadowCanvas, scroll);

    var gl = lightCanvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power"
    });
    var shadowCtx = shadowCanvas.getContext("2d", { alpha: true });

    if (!gl || !shadowCtx) {
      lightCanvas.remove();
      shadowCanvas.remove();
      return;
    }

    var reduceMotion = false;
    try {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {}

    var width = 1;
    var height = 1;
    var lightScale = 0.75;
    var shadowScale = 1;
    var active = false;
    var sceneScheduled = false;
    var lastLightFrame = 0;
    var staticDrawn = false;
    var cachedLight = { x: 0, y: 0, z: 760, progress: 0 };
    var cachedBounds = { cx: 0.5, halfW: 0.28, top: 0.12, bottom: 0.88 };

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function scrollProgress() {
      var maxScroll = Math.max(1, scroll.scrollHeight - scroll.clientHeight);
      return clamp(scroll.scrollTop / maxScroll, 0, 1);
    }

    function lightForScroll() {
      var p = scrollProgress();

      /* 9 o'clock -> 7 o'clock: a small counter-clockwise 60-degree arc. */
      var theta = (180 - p * 60) * Math.PI / 180;
      var radius = Math.min(width, height) * (width <= 760 ? 0.43 : 0.47);

      return {
        x: width * 0.5 + Math.cos(theta) * radius,
        y: height * 0.54 + Math.sin(theta) * radius,
        z: width <= 760 ? 620 : 760,
        progress: p
      };
    }

    function compileShader(type, source) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var message = gl.getShaderInfoLog(shader) || "WebGL shader compile failed";
        gl.deleteShader(shader);
        throw new Error(message);
      }
      return shader;
    }

    var vertexSource = [
      "attribute vec2 a_position;",
      "void main() {",
      "  gl_Position = vec4(a_position, 0.0, 1.0);",
      "}"
    ].join("\\n");

    var fragmentSource = [
      "precision mediump float;",
      "uniform vec2 u_resolution;",
      "uniform float u_time;",
      "uniform vec2 u_light;",
      "uniform vec4 u_bounds;",
      "uniform float u_aspect;",
      "",
      "float sat(float x) { return clamp(x, 0.0, 1.0); }",
      "",
      "void main() {",
      "  vec2 uv = vec2(gl_FragCoord.x / u_resolution.x, 1.0 - gl_FragCoord.y / u_resolution.y);",
      "",
      "  float xNorm = abs((uv.x - u_bounds.x) / max(u_bounds.y, 0.001));",
      "  float beamX = 1.0 - smoothstep(0.70, 1.06, xNorm);",
      "  float above = max(0.0, (u_bounds.z - uv.y) / 0.18);",
      "  float below = max(0.0, (uv.y - u_bounds.w) / 0.22);",
      "  float beamY = 1.0 - smoothstep(0.0, 1.0, max(above, below));",
      "  float corridor = beamX * beamY;",
      "",
      "  vec2 toCenter = vec2(0.5, 0.52) - u_light;",
      "  toCenter.x *= u_aspect;",
      "  vec2 fromLight = uv - u_light;",
      "  fromLight.x *= u_aspect;",
      "  float cone = smoothstep(-0.08, 0.28, dot(normalize(fromLight + vec2(0.0001)), normalize(toCenter + vec2(0.0001))));",
      "",
      "  float distanceFromLight = length(fromLight);",
      "  float perspective = 1.0 + distanceFromLight * 0.72;",
      "  vec2 p = fromLight / perspective;",
      "  p *= 8.0;",
      "",
      "  float t = u_time * 1.12;",
      "  vec2 q = p;",
      "  q.x += 0.34 * sin(p.y * 1.28 + t * 1.18) + 0.12 * sin(p.y * 2.35 - t * 0.84 + 1.4);",
      "  q.y += 0.34 * cos(p.x * 1.16 - t * 1.02) + 0.12 * cos(p.x * 2.08 + t * 0.78);",
      "",
      "  float a = sin(q.x * 2.05 + sin(q.y * 1.55 + t * 0.92));",
      "  float b = cos(q.y * 2.02 + sin(q.x * 1.42 - t * 0.80));",
      "  float c = sin((q.x + q.y) * 1.28 + cos((q.x - q.y) * 1.38 + t * 0.68));",
      "  float d = cos((q.x - q.y) * 1.62 + sin(q.y * 1.10 - t * 0.72));",
      "  float f = (a + b + c + d) * 0.25;",
      "",
      "  float ridge = max(0.0, 1.0 - abs(f) * 1.62);",
      "  float core = pow(ridge, 8.0) * 1.16;",
      "  float halo = pow(max(0.0, 1.0 - abs(f) * 1.00), 2.6) * 0.14;",
      "",
      "  float f2 = sin(q.x * 1.52 + sin(q.y * 2.08 + t * 0.70)) * 0.56 +",
      "             cos(q.y * 1.64 + sin(q.x * 1.86 - t * 0.76)) * 0.44;",
      "  float crossing = pow(max(0.0, 1.0 - abs(f2) * 1.40), 7.0) * 0.28;",
      "  float shimmer = 0.84 + 0.16 * (0.5 + 0.5 * sin(q.x * 0.78 - q.y * 0.61 + t * 1.42));",
      "",
      "  float caustic = sat((core + halo + crossing) * shimmer * cone);",
      "  float field = corridor * (0.72 + 0.28 * cone);",
      "",
      "  vec3 base = vec3(0.905, 0.905, 0.885);",
      "  vec3 highlight = vec3(1.0, 0.998, 0.985);",
      "  vec3 color = mix(base, highlight, sat(caustic * 1.08));",
      "  float alpha = field * (0.54 + caustic * 0.34);",
      "  gl_FragColor = vec4(color, alpha);",
      "}"
    ].join("\\n");

    var program;
    try {
      program = gl.createProgram();
      gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexSource));
      gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentSource));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || "WebGL program link failed");
      }
    } catch (_) {
      lightCanvas.remove();
      shadowCanvas.remove();
      return;
    }

    gl.useProgram(program);

    var positionLocation = gl.getAttribLocation(program, "a_position");
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    var timeLocation = gl.getUniformLocation(program, "u_time");
    var lightLocation = gl.getUniformLocation(program, "u_light");
    var boundsLocation = gl.getUniformLocation(program, "u_bounds");
    var aspectLocation = gl.getUniformLocation(program, "u_aspect");

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    function resizeWorld() {
      var rect = lightCanvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      var mobile = width <= 760;

      /* One logical pixel is already enough for a smooth shader; Retina 2x/3x is wasted work. */
      lightScale = mobile ? 0.86 : 0.74;
      shadowScale = 1;

      lightCanvas.width = Math.max(1, Math.round(width * lightScale));
      lightCanvas.height = Math.max(1, Math.round(height * lightScale));
      shadowCanvas.width = Math.max(1, Math.round(width * shadowScale));
      shadowCanvas.height = Math.max(1, Math.round(height * shadowScale));

      gl.viewport(0, 0, lightCanvas.width, lightCanvas.height);
      shadowCtx.setTransform(shadowScale, 0, 0, shadowScale, 0, 0);
      staticDrawn = false;
      scheduleScene();
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
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop();
        lower.push(point);
      });
      var upper = [];
      for (var i = sorted.length - 1; i >= 0; i -= 1) {
        var point = sorted[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop();
        upper.push(point);
      }
      lower.pop();
      upper.pop();
      return lower.concat(upper);
    }

    function lerpPoint(a, b, t) {
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
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

    function fillHullBlur(points, alpha, blurPx) {
      if (!points.length) return;
      shadowCtx.save();
      shadowCtx.filter = blurPx > 0 ? ("blur(" + blurPx + "px)") : "none";
      shadowCtx.globalAlpha = alpha;
      shadowCtx.fillStyle = "#000";
      shadowCtx.beginPath();
      points.forEach(function (point, index) {
        if (index === 0) shadowCtx.moveTo(point.x, point.y);
        else shadowCtx.lineTo(point.x, point.y);
      });
      shadowCtx.closePath();
      shadowCtx.fill();
      shadowCtx.restore();
    }

    function renderShadows(light, canvasRect, images) {
      shadowCtx.setTransform(shadowScale, 0, 0, shadowScale, 0, 0);
      shadowCtx.clearRect(0, 0, width, height);
      var mobile = width <= 760;

      images.forEach(function (image, index) {
        var rect = image.getBoundingClientRect();
        if (rect.bottom < canvasRect.top - height * 0.4 || rect.top > canvasRect.bottom + height * 0.4) return;

        var elevation = clamp(
          rect.width * (index === 0 ? 0.40 : 0.35),
          mobile ? 72 : 96,
          mobile ? 150 : 220
        );
        var geom = projectRect(rect, light, elevation, canvasRect);

        var broadHull = convexHull(geom.base.concat(geom.projected));
        fillHullBlur(broadHull, mobile ? 0.075 : 0.09, mobile ? 24 : 34);

        var contactHull = convexHull(geom.base.concat(geom.base.map(function (p, idx) {
          return lerpPoint(p, geom.projected[idx], 0.22);
        })));
        fillHullBlur(contactHull, mobile ? 0.36 : 0.40, 0);

        var bands = mobile ? 8 : 10;
        for (var i = 0; i < bands; i += 1) {
          var t0 = 0.08 + (i / bands) * 0.98;
          var t1 = 0.08 + ((i + 1) / bands) * 0.98;
          var near = geom.base.map(function (p, idx) { return lerpPoint(p, geom.projected[idx], t0); });
          var far = geom.base.map(function (p, idx) { return lerpPoint(p, geom.projected[idx], t1); });
          var bandHull = convexHull(near.concat(far));
          var blurPx = mobile ? (0.7 + i * 2.1) : (0.8 + i * 2.8);
          var alpha = mobile ? (0.16 - i * 0.013) : (0.15 - i * 0.011);
          fillHullBlur(bandHull, Math.max(alpha, 0.035), blurPx);
        }
      });
    }

    function measureScene() {
      if (!lightCanvas.isConnected) return;
      var images = Array.prototype.slice.call(scroll.querySelectorAll(".room-image img"));
      if (!images.length) {
        active = false;
        return;
      }

      var canvasRect = lightCanvas.getBoundingClientRect();
      var first = images[0].getBoundingClientRect();
      var last = images[images.length - 1].getBoundingClientRect();
      var padding = height * 0.62;
      active = first.top < canvasRect.bottom + padding && last.bottom > canvasRect.top - padding;

      lightCanvas.style.opacity = active ? "1" : "0";
      shadowCanvas.style.opacity = active ? "1" : "0";
      if (!active) return;

      var minL = Infinity;
      var maxR = -Infinity;
      var minT = Infinity;
      var maxB = -Infinity;
      images.forEach(function (image) {
        var rect = image.getBoundingClientRect();
        minL = Math.min(minL, rect.left - canvasRect.left);
        maxR = Math.max(maxR, rect.right - canvasRect.left);
        minT = Math.min(minT, rect.top - canvasRect.top);
        maxB = Math.max(maxB, rect.bottom - canvasRect.top);
      });

      cachedBounds = {
        cx: ((minL + maxR) * 0.5) / width,
        halfW: (((maxR - minL) * 0.5) + width * 0.12) / width,
        top: (minT - height * 0.10) / height,
        bottom: (maxB + height * 0.16) / height
      };
      cachedLight = lightForScroll();
      renderShadows(cachedLight, canvasRect, images);
      staticDrawn = false;
    }

    function scheduleScene() {
      if (sceneScheduled) return;
      sceneScheduled = true;
      requestAnimationFrame(function () {
        sceneScheduled = false;
        measureScene();
      });
    }

    function renderLight(now) {
      if (!active) return;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      gl.uniform2f(resolutionLocation, lightCanvas.width, lightCanvas.height);
      gl.uniform1f(timeLocation, reduceMotion ? 0 : now * 0.001);
      gl.uniform2f(lightLocation, cachedLight.x / width, cachedLight.y / height);
      gl.uniform4f(boundsLocation, cachedBounds.cx, cachedBounds.halfW, cachedBounds.top, cachedBounds.bottom);
      gl.uniform1f(aspectLocation, width / Math.max(1, height));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function lightLoop(now) {
      if (!lightCanvas.isConnected) return;

      /* Motion speed comes from shader time; frame-rate is intentionally modest for power. */
      var frameInterval = width <= 760 ? 42 : 33;
      if (active && (!reduceMotion || !staticDrawn) && now - lastLightFrame >= frameInterval) {
        lastLightFrame = now;
        renderLight(now);
        staticDrawn = true;
      }
      requestAnimationFrame(lightLoop);
    }

    scroll.addEventListener("scroll", scheduleScene, { passive: true });
    window.addEventListener("resize", resizeWorld, { passive: true });
    window.addEventListener("orientationchange", resizeWorld, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        staticDrawn = false;
        scheduleScene();
      }
    });

    scroll.querySelectorAll(".room-image img").forEach(function (image) {
      if (!image.complete) image.addEventListener("load", scheduleScene, { once: true });
    });

    resizeWorld();
    requestAnimationFrame(lightLoop);
  }
'''

pattern = re.compile(r'  function mountSeawaterWorld\(item\) \{[\s\S]*?\n  \}\n\n\n  var collectionStageResizeFrame')
match = pattern.search(js)
if not match:
    raise SystemExit('mountSeawaterWorld block not found')
js = js[:match.start()] + new_mount + '\n\n  var collectionStageResizeFrame' + js[match.end():]

# Non-home browser chrome follows the restored light paper.
js = js.replace('if (themeMeta) themeMeta.setAttribute("content", "#080a09");',
                'if (themeMeta) themeMeta.setAttribute("content", "#f4f3ee");', 1)

light_css = r'''/* ===== Site-wide light room theme ===== */
/*
  Restore the editorial paper surface for work / collection rooms. The ambient
  homepage remains dark because its own full-screen video field paints above this.
*/
:root {
  --ink: #181914;
  --paper: #f4f3ee;
  --black-hairline: rgba(23, 24, 19, 0.12);
}

html,
body {
  background: #f4f3ee;
}

.room-view {
  background: #f4f3ee;
  color: rgba(23, 24, 19, 0.88);
}

.room-scroll,
.fragrance-room .room-scroll {
  background: #f4f3ee;
}

.room-head {
  border-bottom-color: rgba(23, 24, 19, 0.12);
  background: rgba(244, 243, 238, 0.92);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.38);
}

.room-head > p {
  color: rgba(23, 24, 19, 0.53);
}

.room-head .language button {
  color: rgba(23, 24, 19, 0.30);
}

.room-head .language button:hover,
.room-head .language button.is-active {
  color: rgba(23, 24, 19, 0.88);
}

.room-back {
  color: rgba(23, 24, 19, 0.46);
}

.room-group,
.room-note-title {
  color: rgba(23, 24, 19, 0.38);
}

.room-intro,
.room-note-body,
.room-note-quote p,
.room-footer button {
  color: rgba(23, 24, 19, 0.82);
}

.room-note-quote cite,
.room-image figcaption {
  color: rgba(23, 24, 19, 0.42);
}

.room-visit {
  border-bottom-color: rgba(23, 24, 19, 0.22);
  color: rgba(23, 24, 19, 0.58);
}

.room-visit:hover {
  color: rgba(23, 24, 19, 0.92);
  border-bottom-color: rgba(23, 24, 19, 0.52);
}

.room-notes,
.room-note,
.room-footer {
  border-color: rgba(23, 24, 19, 0.11);
}

.room-view[data-group="collection"] .room-image {
  background: #d8d7d1;
  box-shadow:
    0 0 0 1px rgba(23, 24, 19, 0.065),
    0 24px 64px rgba(55, 54, 49, 0.075);
}

.room-view[data-group="collection"] .room-image figcaption {
  color: rgba(23, 24, 19, 0.40);
}

.room-view[data-group="collection"] .room-image::before {
  opacity: 0.50;
  filter: grayscale(1) blur(18px);
}

/* Fragrance gallery returns to the pale editorial surface too. */
.fragrance-gallery,
.fragrance-theme-nav {
  border-color: rgba(23, 24, 19, 0.11);
  background: #f1f0eb;
}

.fragrance-theme {
  border-right-color: rgba(23, 24, 19, 0.10);
  color: rgba(23, 24, 19, 0.46);
}

.fragrance-theme:hover,
.fragrance-theme.is-active {
  background: rgba(23, 24, 19, 0.045);
  color: rgba(23, 24, 19, 0.88);
}

.fragrance-theme-index,
.fragrance-theme-count,
.fragrance-frame figcaption,
.fragrance-arrow {
  color: rgba(23, 24, 19, 0.34);
}

.fragrance-arrow:hover {
  color: rgba(23, 24, 19, 0.84);
  background: rgba(23, 24, 19, 0.04);
}

.fragrance-thumb.is-active {
  border-color: rgba(23, 24, 19, 0.36);
}

@media (max-width: 760px) {
  .room-view[data-group="collection"] .room-image {
    box-shadow:
      0 0 0 1px rgba(23, 24, 19, 0.06),
      0 18px 42px rgba(55, 54, 49, 0.065);
  }

  .room-view[data-group="collection"] .room-image::before {
    opacity: 0.54;
    filter: grayscale(1) blur(14px);
  }
}

/* ===== Seawater long-space — WebGL caustics + event-driven shadows ===== */
.room-view[data-room="seawater"] {
  background: #f4f3ee;
}

.room-view[data-room="seawater"] .room-scroll {
  position: relative;
  z-index: 3;
  background: transparent;
}

.seawater-world-light,
.seawater-world-shadow {
  position: absolute;
  top: 54px;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: calc(100% - 54px);
  pointer-events: none;
  opacity: 0;
  transition: opacity 420ms ease;
}

.seawater-world-light {
  z-index: 1;
  background: transparent;
  image-rendering: auto;
}

.seawater-world-shadow {
  z-index: 2;
  background: transparent;
}

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
  z-index: 4;
  background: transparent;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.34),
    0 8px 22px rgba(40, 40, 36, 0.085);
}

.room-view[data-room="seawater"] .room-image figcaption {
  z-index: 5;
  color: rgba(23, 24, 19, 0.42);
  text-shadow: none;
}

.room-view[data-room="seawater"] .room-lead,
.room-view[data-room="seawater"] .room-notes,
.room-view[data-room="seawater"] .room-footer {
  position: relative;
  z-index: 4;
}

@media (max-width: 760px) {
  .seawater-world-light,
  .seawater-world-shadow {
    transition-duration: 300ms;
  }
}
'''

css_pattern = re.compile(r'/\* ===== Site-wide dark room theme ===== \*/[\s\S]*\Z')
if not css_pattern.search(css):
    raise SystemExit('dark theme marker not found')
css = css_pattern.sub(light_css + '\n', css)

html = html.replace('<meta name="theme-color" content="#080a09" />',
                    '<meta name="theme-color" content="#f4f3ee" />', 1)

script_path.write_text(js, encoding='utf-8')
style_path.write_text(css, encoding='utf-8')
index_path.write_text(html, encoding='utf-8')
print('WebGL caustics + light theme applied')
