"use strict";

/* Ruin Archive miniature frame v3.1
   No index drawer. The map stays full-size while the architectural frame is
   reduced to roughly 70% of its former depth, with a few restrained, seeded
   chips and hairline fractures. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var resizeRaf = 0;

  function hashString(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seedFor(shell) {
    var old = Number(shell.dataset.ruinFrameSeed || "");
    if (Number.isFinite(old) && old > 0) return old >>> 0;
    var seed;
    try { seed = crypto.getRandomValues(new Uint32Array(1))[0] >>> 0; }
    catch (_) { seed = ((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0); }
    shell.dataset.ruinFrameSeed = String(seed);
    return seed;
  }

  function rngFor(shell, label) {
    return mulberry32((seedFor(shell) ^ hashString(label)) >>> 0);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function parsePct(shell, name, fallback) {
    var raw = getComputedStyle(shell).getPropertyValue(name).trim();
    if (raw && raw.endsWith("%")) return clamp(parseFloat(raw) / 100, 0, 1);
    return fallback;
  }

  function svgFor(w, h) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "ruin-mini-authored-svg");
    svg.setAttribute("viewBox", "0 0 " + Math.max(1, w) + " " + Math.max(1, h));
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function path(svg, d, cls, opacity) {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("class", cls);
    if (opacity != null) p.style.opacity = String(opacity);
    svg.appendChild(p);
    return p;
  }

  function poly(svg, pts, cls, opacity) {
    var d = pts.map(function (p, i) {
      return (i ? "L " : "M ") + p.x.toFixed(2) + " " + p.y.toFixed(2);
    }).join(" ");
    return path(svg, d, cls, opacity);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function hairline(svg, start, end, rng, opacity, branch) {
    var dx = end.x - start.x;
    var dy = end.y - start.y;
    var len = Math.hypot(dx, dy) || 1;
    var nx = -dy / len;
    var ny = dx / len;
    var pts = [start];
    var segments = 5;
    for (var i = 1; i < segments; i += 1) {
      var t = i / segments;
      var wobble = (rng() - 0.5) * 4.2 * Math.sin(Math.PI * t);
      pts.push({ x: start.x + dx * t + nx * wobble, y: start.y + dy * t + ny * wobble });
    }
    pts.push(end);
    poly(svg, pts, "ruin-fracture-crack", opacity);

    if (branch && pts.length > 3) {
      var p = pts[3];
      var sign = rng() < 0.5 ? -1 : 1;
      hairline(svg, p, {
        x: p.x + sign * (10 + rng() * 13),
        y: p.y + (7 + rng() * 13)
      }, rng, opacity * 0.68, false);
    }
  }

  function architecture(shell) {
    var found = shell.querySelector(".ruin-mini-chassis");
    if (found) return found;
    var c = document.createElement("div");
    c.className = "ruin-mini-chassis";
    c.setAttribute("aria-hidden", "true");
    c.innerHTML =
      '<div class="ruin-mini-coords">31°49′50″◉ 113°8′34″◉</div>' +
      '<div class="ruin-mini-authored-fractures"></div>';
    shell.appendChild(c);
    return c;
  }

  function render(shell) {
    architecture(shell);
    var host = shell.querySelector(".ruin-mini-authored-fractures");
    if (!host) return;

    var rect = shell.getBoundingClientRect();
    var w = rect.width;
    var h = rect.height;
    if (w < 140 || h < 140) return;
    host.innerHTML = "";

    var side = parsePct(shell, "--ruin-mini-frame-side", 0.0805);
    var topPct = parsePct(shell, "--ruin-mini-frame-top", 0.042);
    var bottomPct = parsePct(shell, "--ruin-mini-frame-bottom", 0.073);
    var il = w * side;
    var ir = w * (1 - side);
    var it = h * topPct;
    var ib = h * (1 - bottomPct);
    var tl = { x: il, y: it };
    var tr = { x: ir, y: it };
    var br = { x: ir, y: ib };
    var bl = { x: il, y: ib };

    var rng = rngFor(shell, "restrained-frame-v311");
    var svg = svgFor(w, h);

    poly(svg, [{x:0.5,y:0.5}, tl], "ruin-fracture-border ruin-fracture-rail", 0.52);
    poly(svg, [{x:w-0.5,y:0.5}, tr], "ruin-fracture-border ruin-fracture-rail", 0.52);
    poly(svg, [{x:w-0.5,y:h-0.5}, br], "ruin-fracture-border ruin-fracture-rail", 0.46);
    poly(svg, [{x:0.5,y:h-0.5}, bl], "ruin-fracture-border ruin-fracture-rail", 0.46);

    var topCenter = lerp(il, ir, 0.24 + rng() * 0.48);
    var topWidth = 20 + rng() * 24;
    var topDepth = 4.2 + rng() * 4.8;
    var ta = topCenter - topWidth * 0.5;
    var tb = topCenter + topWidth * 0.5;
    poly(svg, [
      tl,
      {x:ta,y:it},
      {x:ta + topWidth*.18,y:it + topDepth*.24},
      {x:ta + topWidth*.43,y:it + topDepth*.90},
      {x:ta + topWidth*.67,y:it + topDepth*.48},
      {x:tb,y:it},
      tr
    ], "ruin-fracture-border", 0.90);

    var gapCenter = lerp(it, ib, 0.34 + rng() * 0.38);
    var gapH = 12 + rng() * 16;
    var ga = gapCenter - gapH * 0.5;
    var gb = gapCenter + gapH * 0.5;
    poly(svg, [tr, {x:ir,y:ga}], "ruin-fracture-border", 0.90);
    poly(svg, [{x:ir,y:gb}, br], "ruin-fracture-border", 0.90);

    var bottomCenter = lerp(il, ir, 0.18 + rng() * 0.62);
    var bottomW = 16 + rng() * 22;
    var bottomD = 3.6 + rng() * 4.2;
    var ba = bottomCenter + bottomW * 0.5;
    var bb = bottomCenter - bottomW * 0.5;
    poly(svg, [
      br,
      {x:ba,y:ib},
      {x:bottomCenter + bottomW*.24,y:ib - bottomD*.36},
      {x:bottomCenter - bottomW*.05,y:ib - bottomD},
      {x:bottomCenter - bottomW*.31,y:ib - bottomD*.42},
      {x:bb,y:ib},
      bl
    ], "ruin-fracture-border", 0.86);

    poly(svg, [bl, tl], "ruin-fracture-border", 0.88);

    var topRoot = {x:ta + topWidth*.43, y:it + topDepth*.90};
    var topDir = topCenter < w * 0.5 ? -1 : 1;
    hairline(svg, topRoot, {
      x: topRoot.x + topDir * (26 + rng() * 28),
      y: topRoot.y + (24 + rng() * 28)
    }, rng, 0.62, true);

    var rightRoot = {x:ir, y:gb};
    hairline(svg, rightRoot, {
      x: rightRoot.x - (28 + rng() * 34),
      y: rightRoot.y + (18 + rng() * 30)
    }, rng, 0.54, rng() < 0.48);

    host.appendChild(svg);
    shell.dataset.fractureReady = "true";
  }

  function enhance() {
    var shell = document.querySelector('.room-view[data-room="ruin-atlas"] .ruin-mini-shell');
    if (!shell) return;
    architecture(shell);
    if (shell.dataset.faithfulFrameV31 !== "1") {
      shell.dataset.faithfulFrameV31 = "1";
      requestAnimationFrame(function () { render(shell); });
    }
  }

  function schedule() {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(function () {
      resizeRaf = 0;
      enhance();
      var shell = document.querySelector('.room-view[data-room="ruin-atlas"] .ruin-mini-shell');
      if (shell) render(shell);
    });
  }

  var app = document.getElementById("app");
  if (app && window.MutationObserver) {
    new MutationObserver(function () { requestAnimationFrame(enhance); })
      .observe(app, { childList: true, subtree: true });
  }
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("orientationchange", schedule, { passive: true });
  requestAnimationFrame(enhance);
})();
