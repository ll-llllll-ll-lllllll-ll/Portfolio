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
    if (!scroll || room.querySelector(".seawater-world-light")) return;

    /*
      Seawater optical space
      ----------------------
      One low-power WebGL canvas now handles both the ambient water caustics and
      the refracted ripple trails behind the two artworks. There is no projected
      shadow layer: each artwork behaves like a transparent cuboid that bends the
      travelling light field and leaves a widening ripple wake downstream.
    */
    var lightCanvas = document.createElement("canvas");
    lightCanvas.className = "seawater-world-light";
    lightCanvas.setAttribute("aria-hidden", "true");
    room.insertBefore(lightCanvas, scroll);

    var gl = lightCanvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power"
    });

    if (!gl) {
      lightCanvas.remove();
      return;
    }

    var reduceMotion = false;
    try {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {}

    var width = 1;
    var height = 1;
    var lightScale = 0.78;
    var active = false;
    var sceneScheduled = false;
    var lastLightFrame = 0;
    var staticDrawn = false;
    var cachedLight = { x: 0, y: 0, z: 760, progress: 0 };
    var cachedBounds = { cx: 0.5, halfW: 0.28, top: 0.12, bottom: 0.88 };
    var cachedRect1 = { left: 0, top: 0, right: 0, bottom: 0 };
    var cachedRect2 = { left: 0, top: 0, right: 0, bottom: 0 };
    var cachedRectCount = 0;

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function scrollProgress() {
      var maxScroll = Math.max(1, scroll.scrollHeight - scroll.clientHeight);
      return clamp(scroll.scrollTop / maxScroll, 0, 1);
    }

    function lightForScroll() {
      var p = scrollProgress();
      /* 9 o'clock -> 7 o'clock: only a restrained counter-clockwise 60-degree arc. */
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
    ].join("\n");

    var fragmentSource = [
      "precision mediump float;",
      "uniform vec2 u_resolution;",
      "uniform float u_time;",
      "uniform vec2 u_light;",
      "uniform vec4 u_bounds;",
      "uniform vec4 u_rect1;",
      "uniform vec4 u_rect2;",
      "uniform float u_rectCount;",
      "uniform float u_aspect;",
      "",
      "float sat(float x) { return clamp(x, 0.0, 1.0); }",
      "",
      "float ambientCaustic(vec2 uv, vec2 light, float t, float aspect) {",
      "  vec2 p = uv - light;",
      "  p.x *= aspect;",
      "  float dist = length(p);",
      "  float perspective = 1.0 + dist * 0.72;",
      "  p = p / perspective * 8.0;",
      "  vec2 q = p;",
      "  q.x += 0.34 * sin(p.y * 1.28 + t * 1.18) + 0.12 * sin(p.y * 2.35 - t * 0.84 + 1.4);",
      "  q.y += 0.34 * cos(p.x * 1.16 - t * 1.02) + 0.12 * cos(p.x * 2.08 + t * 0.78);",
      "  float a = sin(q.x * 2.05 + sin(q.y * 1.55 + t * 0.92));",
      "  float b = cos(q.y * 2.02 + sin(q.x * 1.42 - t * 0.80));",
      "  float c = sin((q.x + q.y) * 1.28 + cos((q.x - q.y) * 1.38 + t * 0.68));",
      "  float d = cos((q.x - q.y) * 1.62 + sin(q.y * 1.10 - t * 0.72));",
      "  float f = (a + b + c + d) * 0.25;",
      "  float ridge = max(0.0, 1.0 - abs(f) * 1.62);",
      "  float core = pow(ridge, 8.0) * 1.10;",
      "  float halo = pow(max(0.0, 1.0 - abs(f) * 0.98), 2.7) * 0.12;",
      "  float crossF = sin(q.x * 1.52 + sin(q.y * 2.08 + t * 0.70)) * 0.56 +",
      "                 cos(q.y * 1.64 + sin(q.x * 1.86 - t * 0.76)) * 0.44;",
      "  float crossing = pow(max(0.0, 1.0 - abs(crossF) * 1.40), 7.0) * 0.24;",
      "  return sat(core + halo + crossing);",
      "}",
      "",
      "float refractedWake(vec2 uv, vec4 rect, vec2 light, float t, float aspect) {",
      "  if (rect.z <= rect.x || rect.w <= rect.y) return 0.0;",
      "  vec2 center = (rect.xy + rect.zw) * 0.5;",
      "  vec2 halfSize = (rect.zw - rect.xy) * 0.5;",
      "  vec2 lightA = vec2(light.x * aspect, light.y);",
      "  vec2 centerA = vec2(center.x * aspect, center.y);",
      "  vec2 dir = normalize(centerA - lightA + vec2(0.0001));",
      "  vec2 perp = vec2(-dir.y, dir.x);",
      "  vec2 rel = uv - center;",
      "  rel.x *= aspect;",
      "  float along = dot(rel, dir);",
      "  float across = dot(rel, perp);",
      "  float halfAlong = abs(dir.x) * halfSize.x * aspect + abs(dir.y) * halfSize.y;",
      "  float halfAcross = abs(perp.x) * halfSize.x * aspect + abs(perp.y) * halfSize.y;",
      "  float dist = along - halfAlong;",
      "  float start = smoothstep(-0.010, 0.022, dist);",
      "  float tail = 1.0 - smoothstep(0.03, 0.46, dist);",
      "  float spread = halfAcross * 0.86 + max(dist, 0.0) * 0.31;",
      "  float lateral = 1.0 - smoothstep(0.66, 1.05, abs(across) / max(spread, 0.001));",
      "  float wakeMask = start * tail * lateral;",
      "  float acrossN = across / max(spread, 0.001);",
      "  float focus = mix(15.5, 8.8, smoothstep(0.0, 0.42, max(dist, 0.0)));",
      "  float waveA = sin(acrossN * focus + dist * 31.0 - t * 3.25 + sin(dist * 17.0 + t * 1.25) * 0.82);",
      "  float waveB = cos(acrossN * (focus * 0.72) - dist * 39.0 + t * 2.72 + sin(acrossN * 4.6 - t) * 0.54);",
      "  float ridgeA = pow(max(0.0, 1.0 - abs(waveA) * 1.52), 7.5);",
      "  float ridgeB = pow(max(0.0, 1.0 - abs(waveB) * 1.62), 8.0) * 0.58;",
      "  float soft = pow(max(0.0, 1.0 - abs(waveA) * 0.92), 2.2) * 0.16;",
      "  float shimmer = 0.86 + 0.14 * sin(dist * 22.0 - acrossN * 3.5 + t * 3.1);",
      "  return sat((ridgeA + ridgeB + soft) * wakeMask * shimmer);",
      "}",
      "",
      "void main() {",
      "  vec2 uv = vec2(gl_FragCoord.x / u_resolution.x, 1.0 - gl_FragCoord.y / u_resolution.y);",
      "  float xNorm = abs((uv.x - u_bounds.x) / max(u_bounds.y, 0.001));",
      "  float beamX = 1.0 - smoothstep(0.70, 1.06, xNorm);",
      "  float above = max(0.0, (u_bounds.z - uv.y) / 0.18);",
      "  float below = max(0.0, (uv.y - u_bounds.w) / 0.22);",
      "  float beamY = 1.0 - smoothstep(0.0, 1.0, max(above, below));",
      "  float corridor = beamX * beamY;",
      "  vec2 toCenter = vec2(0.5, 0.52) - u_light;",
      "  toCenter.x *= u_aspect;",
      "  vec2 fromLight = uv - u_light;",
      "  fromLight.x *= u_aspect;",
      "  float cone = smoothstep(-0.08, 0.28, dot(normalize(fromLight + vec2(0.0001)), normalize(toCenter + vec2(0.0001))));",
      "  float t = u_time * 1.55;",
      "  float baseCaustic = ambientCaustic(uv, u_light, t, u_aspect) * cone;",
      "  float wake = 0.0;",
      "  if (u_rectCount > 0.5) wake = max(wake, refractedWake(uv, u_rect1, u_light, t, u_aspect));",
      "  if (u_rectCount > 1.5) wake = max(wake, refractedWake(uv, u_rect2, u_light, t * 1.04 + 0.7, u_aspect));",
      "  float field = corridor * (0.72 + 0.28 * cone);",
      "  vec3 fieldGrey = vec3(0.895, 0.892, 0.872);",
      "  vec3 warmWhite = vec3(1.0, 0.998, 0.986);",
      "  float lightAmount = sat(baseCaustic * 0.88 + wake * 1.28);",
      "  vec3 color = mix(fieldGrey, warmWhite, lightAmount);",
      "  float alpha = field * (0.34 + baseCaustic * 0.26) + wake * 0.50;",
      "  alpha = sat(alpha);",
      "  gl_FragColor = vec4(color, alpha);",
      "}"
    ].join("\n");

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
      document.documentElement.dataset.seawaterRenderer = "shader-error";
      lightCanvas.remove();
      return;
    }

    gl.useProgram(program);
    document.documentElement.dataset.seawaterRenderer = "webgl-refracted-ripples";

    var positionLocation = gl.getAttribLocation(program, "a_position");
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    var timeLocation = gl.getUniformLocation(program, "u_time");
    var lightLocation = gl.getUniformLocation(program, "u_light");
    var boundsLocation = gl.getUniformLocation(program, "u_bounds");
    var rect1Location = gl.getUniformLocation(program, "u_rect1");
    var rect2Location = gl.getUniformLocation(program, "u_rect2");
    var rectCountLocation = gl.getUniformLocation(program, "u_rectCount");
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
      lightScale = mobile ? 0.86 : 0.78;
      lightCanvas.width = Math.max(1, Math.round(width * lightScale));
      lightCanvas.height = Math.max(1, Math.round(height * lightScale));
      gl.viewport(0, 0, lightCanvas.width, lightCanvas.height);
      staticDrawn = false;
      scheduleScene();
    }

    function rectToUniform(rect, canvasRect) {
      return {
        left: (rect.left - canvasRect.left) / width,
        top: (rect.top - canvasRect.top) / height,
        right: (rect.right - canvasRect.left) / width,
        bottom: (rect.bottom - canvasRect.top) / height
      };
    }

    function measureScene() {
      if (!lightCanvas.isConnected) return;
      var images = Array.prototype.slice.call(scroll.querySelectorAll(".room-image img")).slice(0, 2);
      if (!images.length) {
        active = false;
        lightCanvas.style.opacity = "0";
        return;
      }

      var canvasRect = lightCanvas.getBoundingClientRect();
      var first = images[0].getBoundingClientRect();
      var last = images[images.length - 1].getBoundingClientRect();
      var padding = height * 0.72;
      active = first.top < canvasRect.bottom + padding && last.bottom > canvasRect.top - padding;
      lightCanvas.style.opacity = active ? "1" : "0";
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
        bottom: (maxB + height * 0.18) / height
      };

      cachedLight = lightForScroll();
      cachedRect1 = rectToUniform(images[0].getBoundingClientRect(), canvasRect);
      cachedRect2 = images[1]
        ? rectToUniform(images[1].getBoundingClientRect(), canvasRect)
        : { left: 0, top: 0, right: 0, bottom: 0 };
      cachedRectCount = images.length;
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
      gl.uniform4f(rect1Location, cachedRect1.left, cachedRect1.top, cachedRect1.right, cachedRect1.bottom);
      gl.uniform4f(rect2Location, cachedRect2.left, cachedRect2.top, cachedRect2.right, cachedRect2.bottom);
      gl.uniform1f(rectCountLocation, cachedRectCount);
      gl.uniform1f(aspectLocation, width / Math.max(1, height));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function lightLoop(now) {
      if (!lightCanvas.isConnected) return;
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
  }'''

pattern = re.compile(r'  function mountSeawaterWorld\(item\) \{.*?\n  \}\n+\s*var collectionStageResizeFrame', re.S)
match = pattern.search(js)
if not match:
    raise SystemExit('mountSeawaterWorld block not found')
js = pattern.sub(new_function + '\n\n  var collectionStageResizeFrame', js, count=1)

# Append a concise override for the new single-canvas optical renderer.
marker = '/* ===== Seawater refracted-ripple renderer ===== */'
if marker in css:
    css = css[:css.index(marker)].rstrip() + '\n'
css += r'''

/* ===== Seawater refracted-ripple renderer ===== */
.room-view[data-room="seawater"] {
  background: #f4f3ee;
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

.room-view[data-room="seawater"] .seawater-world-light {
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
  transition: opacity 420ms ease;
  background: transparent;
  image-rendering: auto;
}

.room-view[data-room="seawater"] .seawater-world-shadow {
  display: none !important;
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
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.34);
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
  .room-view[data-room="seawater"] .seawater-world-light {
    transition-duration: 300ms;
  }
}
'''

# Cache bust the public assets so the new renderer replaces the previous build immediately.
html = re.sub(r'href="\./style\.css(?:\?v=[^"]*)?"', 'href="./style.css?v=20261002-1600"', html)
html = re.sub(r'src="\./calendar/library\.js(?:\?v=[^"]*)?"', 'src="./calendar/library.js?v=20261002-1600"', html)
html = re.sub(r'src="\./script\.js(?:\?v=[^"]*)?"', 'src="./script.js?v=20261002-1600"', html)

script_path.write_text(js, encoding='utf-8')
style_path.write_text(css, encoding='utf-8')
index_path.write_text(html, encoding='utf-8')
print('replaced projected shadows with WebGL refracted ripple wakes')
